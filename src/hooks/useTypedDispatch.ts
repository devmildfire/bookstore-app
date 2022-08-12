import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/models';

const useTypedDispatch = (): AppDispatch => useDispatch();

export default useTypedDispatch;
