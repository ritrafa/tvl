// app/api/tvl/[daoGovernanceProgramId]/route.js
import { Connection, PublicKey } from '@solana/web3.js';
import { getAllGovernances, getNativeTreasuryAddress, getRealms } from '@solana/spl-governance';
import { NextResponse } from 'next/server';
import { Client } from 'pg';

export const maxDuration = 60;

const SOLANA_MAINNET = process.env.RPC_URL;
const JUPITER_API_URL = 'https://price.jup.ag/v4/price';
const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
const SOL_MINT_ADDRESS = 'So11111111111111111111111111111111111111112';
const tokenPriceCache = {}; // Cache for token prices

const connection = new Connection(SOLANA_MAINNET);

// PostgreSQL client setup
const pgClient = new Client({
  connectionString: process.env.POSTGRES_URL,
});

pgClient.connect();

async function getTokenPrice(mintAddress) {
  if (tokenPriceCache[mintAddress]) {
    return tokenPriceCache[mintAddress];
  }

  try {
    const response = await fetch(`${JUPITER_API_URL}?ids=${mintAddress}`);
    const data = await response.json();
    const price = data.data[mintAddress]?.price || 0;

    // Store the price in the cache
    tokenPriceCache[mintAddress] = price;
    return price;
  } catch (error) {
    console.error(`Error fetching price for token ${mintAddress}:`, error);
    return 0;
  }
}

async function getTokenBalances(treasuryAddresses) {
  let totalValue = 0;

  for (const address of treasuryAddresses) {
    // Fetch and account for SOL balance
    const solBalanceLamports = await connection.getBalance(new PublicKey(address));
    const solPrice = await getTokenPrice(SOL_MINT_ADDRESS);
    const solBalance = solBalanceLamports / 1_000_000_000; // Convert lamports to SOL
    totalValue += solBalance * solPrice;

    // Fetch and account for SPL token balances
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
      new PublicKey(address),
      { programId: TOKEN_PROGRAM_ID }
    );

    for (const { account } of tokenAccounts.value) {
      const mintAddress = account.data.parsed.info.mint;
      const balance = account.data.parsed.info.tokenAmount.uiAmount;
      const price = await getTokenPrice(mintAddress);
      totalValue += balance * price;
    }
  }

  return totalValue;
}

export async function GET(request, { params }) {
  const { daoGovernanceProgramId } = params;

  try {
    let totalValue = 0;

    // Check the postgres table 'tvl' to see if there is an daoGovernanceProgramId entry that is less than 14 days old
    const { rows: existingRows } = await pgClient.query(
      `SELECT value FROM tvl WHERE realm = $1 AND timestamp > NOW() - INTERVAL '14 days' ORDER BY timestamp DESC LIMIT 1`,
      [daoGovernanceProgramId]
    );

    if (existingRows.length > 0) {
      console.log(`Using cached TVL for daoGovernanceProgramId: ${daoGovernanceProgramId}`);
      totalValue = parseFloat(existingRows[0].value).toFixed(2);
      return NextResponse.json({ daoGovernanceProgramId, totalValue });
    }


    // Fetch all realms associated with the DAO governance program id
    const realms = await getRealms(connection, new PublicKey(daoGovernanceProgramId));
    console.log('daoGovernanceProgramId: ', daoGovernanceProgramId, 'size: ', realms.length);


    // Process realms in batches of 25
    const batchSize = 25;
    for (let i = 0; i < realms.length; i += batchSize) {
      console.log(i);
      const realmBatch = realms.slice(i, i + batchSize);

      const batchResults = await Promise.all(
        realmBatch.map(async (realm) => {
          console.log('Processing realm', realm.pubkey.toBase58());

          // Check the postgres table 'tvl' to see if there is an entry that is less than 30 days old
          const { rows: existingRows } = await pgClient.query(
            `SELECT value FROM tvl WHERE realm = $1 AND timestamp > NOW() - INTERVAL '30 days' ORDER BY timestamp DESC LIMIT 1`,
            [realm.pubkey.toBase58()]
          );

          if (existingRows.length > 0) {
            console.log(`Using cached TVL for realm: ${realm.pubkey.toBase58()}`);
            return parseFloat(existingRows[0].value);
          }

          // Fetch all governance accounts for the realm
          const governances = await getAllGovernances(
            connection,
            new PublicKey(realm.owner.toBase58()),
            new PublicKey(realm.pubkey.toBase58())
          );

          // Get treasury addresses for each governance account
          const treasuryAddresses = await Promise.all(
            governances.map(async (governance) => {
              return getNativeTreasuryAddress(
                new PublicKey(realm.owner.toBase58()),
                governance.pubkey
              );
            })
          );

          // Calculate the TVL for the current realm
          const realmValue = await getTokenBalances(treasuryAddresses);

          // Add line to postgres 'tvl' table with realm, total value, and timestamp
          await pgClient.query(
            `INSERT INTO tvl (realm, value, timestamp) VALUES ($1, $2, NOW())`,
            [realm.pubkey.toBase58(), realmValue]
          );

          return realmValue;
        })
      );

      // Sum up the results from the batch
      totalValue += batchResults.reduce((sum, value) => sum + value, 0);
    }

    // Add line to postgres 'tvl' table with daoGovernanceProgramId, total value, and timestamp
    await pgClient.query(
      `INSERT INTO tvl (realm, value, timestamp) VALUES ($1, $2, NOW())`,
      [daoGovernanceProgramId, totalValue]
    );

    totalValue = totalValue.toFixed(2);

    return NextResponse.json({ daoGovernanceProgramId, totalValue });
  } catch (error) {
    console.error('error', error);
    return NextResponse.json({ error: 'An error occurred while calculating TVL.' }, { status: 500 });
  }
}
