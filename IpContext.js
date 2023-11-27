import {createContext } from 'react';

const IpContext = createContext({
    ipRas: null,
    setIpRas: () => {},
    ipLap: null,
    setIpLap: () => {},
});

export default IpContext;
