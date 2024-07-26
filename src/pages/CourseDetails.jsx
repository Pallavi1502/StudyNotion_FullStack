import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { BuyCourse } from '../services/operations/studentFeaturesAPI'
import { useNavigate, useParams } from 'react-router-dom'


const CourseDetails = () => {

const dispatch= useDispatch()
const navigate= useNavigate()

const { token } = useSelector((state) => state.auth)
const {user }= useSelector((state) => state.profile)
const { courseId } = useParams()
console.log("courseid in pages", courseId)


  const handleBuyCourse= async() => {
    console.log("inside handle buy course")
    if(token){
      BuyCourse(token, [courseId],user,navigate, dispatch)
      return;
    }
    
  }
  return (
    <div className='flex items-center'>
      <button className='bg-yellow-100 p-2 text-black'
      onClick={() => handleBuyCourse()}>
        Buy Now
      </button>
    </div>
  )
}

export default CourseDetails
