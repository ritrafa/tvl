# TVL

This project provides an API to calculate and return the Total Value Locked (TVL) for various DAOs on the Solana blockchain. The API fetches SOL and SPL token balances held in the treasuries of all the DAOs governed by a set of governance program IDs and returns their USD value.

## Getting Started

### Dependencies

This project relies on several dependencies, including:

- Node.js v14 or higher
- PostgreSQL database
- Next.js
- Solana Web3.js
- SPL Governance SDK

### Installation

Clone the repository and install the required dependencies:

    git clone https://github.com/ritrafa/tvl.git
    cd tvl
    npm install

### Environment Variables

You need to create a .env file in the root of your project and define the following environment variables:

    RPC_URL={rpc url}
    NEXT_PUBLIC_BASE_URL=http://localhost:3000
    POSTGRES_URL={postgres impl}
    POSTGRES_PRISMA_URL={postgres impl}
    POSTGRES_URL_NO_SSL={postgres impl}
    POSTGRES_URL_NON_POOLING={postgres impl}
    POSTGRES_USER={postgres impl}
    POSTGRES_HOST={postgres impl}
    POSTGRES_PASSWORD={postgres impl}
    POSTGRES_DATABASE={postgres impl}

### Database Setup

This project uses PostgreSQL to cache the TVL values. Create the necessary table by running the following SQL command in your PostgreSQL database:

    CREATE TABLE tvl (
        id SERIAL PRIMARY KEY,
        realm VARCHAR(255) NOT NULL,
        value NUMERIC NOT NULL,
        timestamp TIMESTAMPTZ NOT NULL,
        CONSTRAINT unique_realm_timestamp UNIQUE (realm, timestamp)
    );

### Running the API

To start the API server:

    npm run dev

This will start the Next.js server on http://localhost:3000.

## API Endpoints

### GET /api/tvl/[daoGovernanceProgramId]

Description: Fetches the TVL for a specific DAO identified by the daoGovernanceProgramId.

Example Request:

    GET /api/tvl/GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw

Example Response:

    {
      "daoGovernanceProgramId": "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
      "totalValue": "12345.67"
    }

### GET /api/tvl/all

Description: Fetches the TVL for all DAOs defined in the DAO_GOVERNANCE_IDS array.

Example Request:

    GET /api/tvl/all

Example Response:

    [
    {
        "daoGovernanceProgramId": "all",
        "totalValue": "123456789.01"
    }
    {
        "daoGovernanceProgramId": "GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
        "totalValue": "12345.67"
    },
    ...
    ]

## Warnings

Based on my free plan on vercel, the api will timeout after 60 seconds if it is not complete. Once all realms are cached this is not a problem, but it could take multiple runs to complete the large set (3000+) of realms in the standard governance program id.
