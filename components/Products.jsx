"use client"

import React, { useContext } from 'react'
import Table from './Table'
import { DataContext } from '@/Context/DataContext';
import { redirect } from 'next/navigation';

const Products = () => {
  const { user, error, isLoading } = useUser();

    const { data, setdata } = useContext(DataContext);
    if (!user) {
      return redirect('/login');
    }
  return (
    <div><Table data={data} mode="products"/> </div>
  )
}

export default Products