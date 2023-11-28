import {createContext } from 'react';

const IpContext = createContext({
    upcnt: null,
    setUpcnt: () => {},
    downcnt: null,
    setDowncnt: () => {},
    numplate: null,
    setNumplate: () => {},
    record: null,
    setRecord: () => {},
    ipRas: null,
    setIpRas: () => {},
    ipLap: null,
    setIpLap: () => {},
});

export default IpContext;
