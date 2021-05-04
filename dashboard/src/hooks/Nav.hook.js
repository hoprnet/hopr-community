import { useSelector, useDispatch } from 'react-redux';
import { push, goBack } from 'connected-react-router';

export function useNavigation() {
  const location = useSelector(state => state.router.location);
  const dispatch = useDispatch();
  function navigate(url) {
    dispatch(push(url));
  }
  function pop() {
    dispatch(goBack());
  }
  return [location, navigate, pop];
}
