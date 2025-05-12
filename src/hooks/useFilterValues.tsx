import { useCallback } from 'react';
import { fetchFilterValues } from '../fetchGraphData';

/**
 * Hook for fetching and managing filter values
 * @returns Object containing filter values and refresh function
 */
export const useFilterValues = () => {
  // Function to get filter values for a specific key
  const getFilterValues = useCallback(async (key: string): Promise<string[]> => {
    try {
      console.log('Fetching filter values for key:', key);
      const values = await fetchFilterValues(key);
      console.log('Filter values fetched successfully:', values.length);
      return values;
    } catch (error) {
      console.error('Error fetching filter values:', error);
      return [];
    }
  }, []);

  return {
    getFilterValues,         // Function to fetch filter values
  };
};
