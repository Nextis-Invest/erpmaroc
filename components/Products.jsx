"use client"

import React, { useContext } from 'react'
import Table from './Table'
import { DataContext } from '@/Context/DataContext';

const Products = () => {
    const { data, setdata } = useContext(DataContext);
  return (
    <div><Table data={data} mode="products"/></div>
  )
}

export default Products