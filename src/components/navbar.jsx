import React, { useContext, useState } from "react";
import { GiHamburgerMenu } from "react-icons/gi";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstance from "../axios";
import { Context } from "../main";

const Navbar = () => {
  const [show, setShow] = useState(false);
  const { isAuthenticated, setIsAuthenticated } = useContext(Context);

  const handleLogout = async () => {
    localStorage.clear();
    setIsAuthenticated(false);
    goToLogin();
    toast.success('User Logged Out Successfully');
    // await axiosInstance
    //   .get("user/patient/logout", {
    //     withCredentials: true,
    //   })
    //   .then((res) => {
    //     toast.success(res.data.message);
    //     setIsAuthenticated(false);
    //   })
    //   .catch((err) => {
    //     toast.error(err.response.data.message);
    //   });
  };

  const navigateTo = useNavigate();

  const goToLogin = () => {
    navigateTo("/login");
  };

  const goToReg = () => {
    navigateTo("/register");
  };

  return (
    <>
      <nav className={"container"}>
        <div className="logo">
          <img src="/logo.png" alt="logo" className="logo-img" />
        </div>
        <div className={show ? "navLinks showmenu" : "navLinks"}>
          <div className="links">

            {/* Only show Profile link if user is authenticated */}
            {isAuthenticated && (
              <Link to={"/profile"} onClick={() => setShow(!show)}>
                Profile
              </Link>
            )}

            <Link to={"/"} onClick={() => setShow(!show)}>
              Home
            </Link>

              <Link to={"/doctors"} onClick={() => setShow(!show)}>
              Doctors
            </Link>
            
            <Link to={"/appointment"} onClick={() => setShow(!show)}>
              Appointment
            </Link>

        
            <Link to={"/about"} onClick={() => setShow(!show)}>
              About Us
            </Link>
          </div>

          {/* Only show REGISTER button if user is not authenticated */}
          {!isAuthenticated && (
            <button className="loginBtn btn" id="regBtn" onClick={goToReg}>
              REGISTER
            </button>
          )}

          {isAuthenticated ? (
            <button className="logoutBtn btn" onClick={handleLogout}>
              LOGOUT
            </button>
          ) : (
            <button className="loginBtn btn" onClick={goToLogin}>
              LOGIN
            </button>
          )}
        </div>
        <div className="hamburger" onClick={() => setShow(!show)}>
          <GiHamburgerMenu />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
