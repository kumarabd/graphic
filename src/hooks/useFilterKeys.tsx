import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { unwrapResult } from '@reduxjs/toolkit';
import { fetchFilterKeysThunk } from '../fetchGraphData';
import { AppDispatch, RootState } from '../store';

/**
 * Hook for fetching and managing filter keys
 * @returns Object containing filter keys and refresh function
 */
export const useFilterKeys = () => {
  // Get Redux dispatch for data fetching
  const dispatch = useDispatch<AppDispatch>();
  
  // Get filter keys from Redux store (assuming they're stored there)
  // If not stored in Redux, you might need to add a local state here
  const filterKeys = useSelector((state: RootState) => 
    state.graph.filterKeys || []
  );
  
  // Function to refresh filter keys from the API
  const refreshFilterKeys = useCallback(async () => {
    try {
      console.log('Refreshing filter keys from API...');
      const resultAction = await dispatch(fetchFilterKeysThunk());
      
      if (resultAction.type.endsWith('/fulfilled')) {
        // Safely unwrap the result
        const payload = unwrapResult(resultAction);
        console.log('Filter keys refreshed successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error refreshing filter keys:', error);
      return false;
    }
  }, [dispatch]);

  return {
    filterKeys,         // Available filter keys
    refreshFilterKeys   // Function to refresh filter keys from the API
  };
};
