import { createContext } from 'react';

const IpContext = createContext({
    level: null,
    setLevel: () => {},
    reportcnt: null,
    setReportcnt: () => {},
    reportedcnt: null,
    setReportedcnt: () => {},
    upCnt: null,
    setUpCnt: () => {},
    downCnt: null,
    setDownCnt: () => {},
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
