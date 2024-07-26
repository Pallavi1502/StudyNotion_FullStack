import React from 'react'

const IconBtn = ( {
    text,
    onclick,
    children,
    disabled,
    outline=false,
    customClasses,
    type,
}) =>{
  return (
    <button
        disabled={disabled}
        onClick={onclick}
        type={type}
        className={customClasses}
    >
        {
            children ? ( 
                <>
                <span> {text} </span>
                </>
            ):(text)
        }
    </button>
  )
}

export default IconBtn
