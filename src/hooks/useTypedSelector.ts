import { TypedUseSelectorHook, useSelector } from 'react-redux';
import { Store } from '@/models';

const useTypedSelector: TypedUseSelectorHook<Store> = useSelector;

export default useTypedSelector;
