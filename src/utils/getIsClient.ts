const getIsClient = (): boolean => typeof window !== 'undefined';

export default getIsClient;
