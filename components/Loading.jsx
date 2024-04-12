import React from 'react'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'


const Loading = ({size}) => {
  return (
    <div>
        <FontAwesomeIcon icon={faSpinner} size={size} color='#0460eb' spin />
    </div>
  )
}

export default Loading