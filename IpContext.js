import { createContext } from 'react';

const IpContext = createContext({
    level: null,
    setLevel: () => {},
    reportCnt: null,
    setReportCnt: () => {},
    reportedCnt: null,
    setReportedCnt: () => {},
    upCnt: null,
    setUpCnt: () => {},
    downCnt: null,
    setDownCnt: () => {},
    overCnt: null,
    setOverCnt: () => {},
    numplate: null,
    setNumplate: () => {},
    record: null,
    setRecord: () => {},
    totRecord: null,
    setTotRecord: () => {},
    ipRas: null,
    setIpRas: () => {},
    ipLap: null,
    setIpLap: () => {},
});

export default IpContext;
