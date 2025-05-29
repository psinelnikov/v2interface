import React from "react";
import { Link } from "react-router-dom";
import { MenuItems } from "./MenuItems";
import "./NavBar.css";
import { useLocation } from "react-router-dom";

function NavBar() {
  const location = useLocation();
  return (
    <nav className="mainNav">
      {/* <div className="Title">
        <h1 className="navbar-logo">
          Alternative Uniswap Interface
        </h1>
      </div> */}

      <div className="NavbarItems">
        <ul className={`nav-menu`}>
          {MenuItems.map((item, index) => {
            const isActive = location.pathname === item.url;
            return (
              <li key={index}>
                <Link
                  className={
                    isActive ? "nav-links nav-links-clicked" : "nav-links"
                  }
                  to={item.url}
                >
                  {item.title}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}

export default NavBar;
