// app/api/tvl/all/route.js
import axios from 'axios';
import { NextResponse } from 'next/server';

const DAO_IDS = [
"GovER5Lthms3bLBqWub97yVrMmEogzX7xNjdXpPPCVZw", //3013
"gUAedF544JeE6NYbQakQvribHykUNgaPJqcgf3UQVnY",
//"GqTPL6qRf5aUuqscLh8Rg2HTxPUXfhhAXDptTLhp1t2J", //12
//"DcG2PZTnj8s4Pnmp7xJswniCskckU5E6XsrKuyD7NYFK",
//"AEauWRrpn9Cs6GXujzdp1YhMmv2288kBt3SdEcPYEerr",
//"G41fmJzd29v7Qmdi8ZyTBBYa98ghh3cwHBTexqCG1PQJ",
//"GovHgfDPyQ1GwazJTDY2avSVY8GGcpmCapmmCsymRaGe",
//"pytGY6tWRgGinSCvRLnSv4fHfBTMoiDGiCsesmHWM6U",
//"J9uWvULFL47gtCPvgR3oN7W357iehn5WF2Vn9MJvcSxz",
//"JPGov2SBA6f7XSJF5R4Si5jEJekGiyrwP2m7gSEqLUs",
//"Ghope52FuF6HU3AAhJuAAyS2fiqbVhkAotb7YprL5tdS", //13
//"5sGZEdn32y8nHax7TxEyoHuPS3UXfPWtisgm8kqxat8H",
//"smfjietFKFJ4Sbw1cqESBTpPhF4CwbMwN8kBEC1e5ui",
//"GovMaiHfpVPw8BAM1mbdzgmSZYDw2tdP32J2fapoQoYs",
//"GCockTxUjxuMdojHiABVZ5NKp6At8eTKDiizbPjiCo4m",
//"HT19EcD68zn7NoCF79b2ucQF8XaMdowyPt5ccS6g1PUx",
//"GRNPT8MPw3LYY6RdjsgKeFji5kMiG1fSxnxDjDBu4s73",
//"ALLGnZikNaJQeN4KCAbDjZRSzvSefUdeTpk18yfizZvT",
//"A7kmu2kUcnQwAVn8B4znQmGJeUrsJ1WEhYVMtmiBLkEr",
//"MGovW65tDhMMcpEmsegpsdgvzb6zUwGsNjhXFxRAnjd",
//"jdaoDN37BrVRvxuXSeyR7xE5Z9CAoQApexGrQJbnj6V",
//"GMnke6kxYvqoAXgbFGnu84QzvNHoqqTnijWSXYYTFQbB",
//"hgovkRU6Ghe1Qoyb54HdSLdqN7VtxaifBzRmh9jtd3S", //7
//"jtogvBNH3WBSWDYD5FJfQP2ZxNTuf82zL8GkEhPeaJx",
//"dgov7NC8iaumWw3k8TkmLDybvZBCmd1qwxgLAGAsWxf"
];

export async function GET() {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
      const results = await Promise.all(DAO_IDS.map(daoId => axios.get(`${baseUrl}/api/tvl/${daoId}`)));
  
      const tvlData = results.map(result => result.data);
  
      return NextResponse.json(tvlData);
    } catch (error) {
      console.error('error');
      return NextResponse.json({ error: 'An error occurred while calculating TVL for all DAOs.' }, { status: 500 });
    }
  }