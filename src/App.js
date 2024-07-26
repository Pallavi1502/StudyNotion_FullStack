import "./App.css";
import { Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Navbar from "./components/common/Navbar"
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import OpenRoute from "./components/core/Auth/OpenRoute";
import ForgotPassword from "./pages/ForgotPassword";
import { Toaster } from "react-hot-toast";
import VerifyEmail from "./pages/VerifyEmail";
import UpdatePassword from "./pages/UpdatePassword";
import PrivateRoute from "./components/core/Auth/PrivateRoute";
import Error from "./pages/Error"
import { ACCOUNT_TYPE } from "./utils/constants";
import MyProfile from "./components/core/Dashboard/MyProfile";
import Dashboard from "./pages/Dashboard";
import Settings from "./components/core/Dashboard/Settings";
import Cart from "./components/core/Dashboard/Cart";
import EnrolledCourses from "./components/core/Dashboard/EnrolledCourses";
import AddCourse from "./components/core/Dashboard/AddCourse"
import MyCourses from "./components/core/Dashboard/MyCourses";
import EditCourse from "./components/core/Dashboard/EditCourse";
import { useSelector } from "react-redux";
import Catalog from "./pages/Catalog";
import CourseDetails from "./pages/CourseDetails";


function App() {

  const {user} = useSelector( (state) => state.profile )
  return (
    <div className="w-screen min-h-screen bg-richblack-900 flex flex-col font-inter">
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="catalog/:catalogName" element={<Catalog />} />
      <Route path="courses/:courseId" element={<CourseDetails />} />

      <Route 
        path="login" 
        element={
          <OpenRoute>
            <Login />
          </OpenRoute>
          } />
      <Route 
        path="signup" 
        element={
          <OpenRoute>
            <Signup />
          </OpenRoute>
        } />
      <Route
          path="forgot-password"
          element={
            <OpenRoute>
              <ForgotPassword />
            </OpenRoute>
          }
        />  
        <Route
          path="verify-email"
          element={
            <OpenRoute>
              <VerifyEmail />
            </OpenRoute>
          }
        />  
        <Route
          path="update-password/:id"
          element={
            <OpenRoute>
              <UpdatePassword />
            </OpenRoute>
          }
        />  

        <Route 
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        >
          <Route path="dashboard/my-profile" element={<MyProfile />} />
          <Route path="dashboard/settings" element={<Settings />} />
          {
            user?.accountType === ACCOUNT_TYPE.STUDENT &&(
              <>
                <Route path="dashboard/cart" element={ <Cart /> } />
                <Route path="dashboard/enrolled-courses" element={ <EnrolledCourses /> } />
              </>
            ) 
          }
          {
            user?.accountType === ACCOUNT_TYPE.INSTRUCTOR &&(
              <>
                <Route path="dashboard/add-course" element={ <AddCourse /> } />
                <Route path="dashboard/my-courses" element={ <MyCourses /> } />
                <Route path="dashboard/edit-course/:courseId" element={ <EditCourse /> } />
              </>
            ) 
          }
        </Route>  
          

        <Route
          path="*" element={<Error /> } />  

    </Routes>
    
    <Toaster />
   </div>
  
  );
}

export default App;
