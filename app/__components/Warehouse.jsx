"use client"

import { DataContext } from '@/Context/DataContext';
import React, { useContext } from 'react'
import Table from './Table';

const Warehouse = () => {
    const { data, setdata } = useContext(DataContext);
  return (
    <div><Table data={data} mode="warehouse" /></div>
  )
}

export default Warehouse