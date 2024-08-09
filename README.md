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
        "daoGovernanceProgramId":"all",
        "totalValue":"1140458150.22"
    },
    {
        "daoGovernanceProgramId":"GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw",
        "totalValue":"333630491.88"
    },
    ...
    ]

## Caching

This implementation is using the db caching explained above as well as caching prices during any active load of a realm treasury address so as to reduce the calls to JUP's api. The db caches overall program id totals for 14 days and individual realm accounts for 30 days.

## Warnings

Based on my free plan on vercel, the api will timeout after 60 seconds if it is not complete. Once all realms are cached this is not a problem, but it could take multiple runs to complete the large set (3000+) of realms in the standard governance program id.

## Full Output

As of 8/8/2024:

    [{"daoGovernanceProgramId":"all","totalValue":"1140458150.22"},{"daoGovernanceProgramId":"GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw","totalValue":"333630491.88"},{"daoGovernanceProgramId":"gUAedF544JeE6NYbQakQvribHykUNgaPJqcgf3UQVnY","totalValue":"2548.61"},{"daoGovernanceProgramId":"GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J","totalValue":"32099957.43"},{"daoGovernanceProgramId":"DcG2PZTnj8s4Pnmp7xJswniCskckU5E6XsrKuyD7NYFK","totalValue":"43.94"},{"daoGovernanceProgramId":"AEauWRrpn9Cs6GXujzdp1YhMmv2288kBt3SdEcPYEerr","totalValue":"48879959.25"},{"daoGovernanceProgramId":"G41fmJzd29v7Qmdi8ZyTBBYa98ghh3cwHBTexqCG1PQJ","totalValue":"156.04"},{"daoGovernanceProgramId":"GovHgfDPyQ1GwazJTDY2avSVY8GGcpmCapmmCsymRaGe","totalValue":"764005.31"},{"daoGovernanceProgramId":"pytGY6tWRgGinSCvRLnSv4fHfBTMoiDGiCsesmHWM6U","totalValue":"2654.48"},{"daoGovernanceProgramId":"J9uWvULFL47gtCPvgR3oN7W357iehn5WF2Vn9MJvcSxz","totalValue":"0.00"},{"daoGovernanceProgramId":"JPGov2SBA6f7XSJF5R4Si5jEJekGiyrwP2m7gSEqLUs","totalValue":"1075887.67"},{"daoGovernanceProgramId":"Ghope52FuF6HU3AAhJuAAyS2fiqbVhkAotb7YprL5tdS","totalValue":"32636.56"},{"daoGovernanceProgramId":"5sGZEdn32y8nHax7TxEyoHuPS3UXfPWtisgm8kqxat8H","totalValue":"0.00"},{"daoGovernanceProgramId":"smfjietFKFJ4Sbw1cqESBTpPhF4CwbMwN8kBEC1e5ui","totalValue":"0.00"},{"daoGovernanceProgramId":"GovMaiHfpVPw8BAM1mbdzgmSZYDw2tdP32J2fapoQoYs","totalValue":"68640568.74"},{"daoGovernanceProgramId":"GCockTxUjxuMdojHiABVZ5NKp6At8eTKDiizbPjiCo4m","totalValue":"39.87"},{"daoGovernanceProgramId":"HT19EcD68zn7NoCF79b2ucQF8XaMdowyPt5ccS6g1PUx","totalValue":"495.39"},{"daoGovernanceProgramId":"GRNPT8MPw3LYY6RdjsgKeFji5kMiG1fSxnxDjDBu4s73","totalValue":"0.00"},{"daoGovernanceProgramId":"ALLGnZikNaJQeN4KCAbDjZRSzvSefUdeTpk18yfizZvT","totalValue":"0.00"},{"daoGovernanceProgramId":"A7kmu2kUcnQwAVn8B4znQmGJeUrsJ1WEhYVMtmiBLkEr","totalValue":"13.48"},{"daoGovernanceProgramId":"MGovW65tDhMMcpEmsegpsdgvzb6zUwGsNjhXFxRAnjd","totalValue":"619.45"},{"daoGovernanceProgramId":"jdaoDN37BrVRvxuXSeyR7xE5Z9CAoQApexGrQJbnj6V","totalValue":"11793.02"},{"daoGovernanceProgramId":"GMnke6kxYvqoAXgbFGnu84QzvNHoqqTnijWSXYYTFQbB","totalValue":"130664.99"},{"daoGovernanceProgramId":"hgovkRU6Ghe1Qoyb54HdSLdqN7VtxaifBzRmh9jtd3S","totalValue":"553.60"},{"daoGovernanceProgramId":"jtogvBNH3WBSWDYD5FJfQP2ZxNTuf82zL8GkEhPeaJx","totalValue":"655185057.51"},{"daoGovernanceProgramId":"dgov7NC8iaumWw3k8TkmLDybvZBCmd1qwxgLAGAsWxf","totalValue":"3.00"}]
