import {createContext } from 'react';

const IpContext = createContext({
    numplate: null,
    setNumplate: () => {},
    ipRas: null,
    setIpRas: () => {},
    ipLap: null,
    setIpLap: () => {},
});

export default IpContext;
