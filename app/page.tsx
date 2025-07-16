import Upload from '@/components/Upload'
import React from 'react'

const page = ({ req }) => {

  console.log(req)
  return (
    <div className='h-dvh p-2'>
   <Upload/>
    </div>
  )
}

export default page
