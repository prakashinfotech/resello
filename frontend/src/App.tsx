import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './router/index.tsx';
import { useAppDispatch, useAppSelector } from './store/hooks';
import { getProfile } from './store/slices/authSlice';

function App() {
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.auth.token);
  const user = useAppSelector((state) => state.auth.user);

  // Rehydrate user from token on app load
  useEffect(() => {
    if (token && !user) {
      dispatch(getProfile());
    }
  }, [token, user, dispatch]);

  return <RouterProvider router={router} />;
}

export default App;
