import React from "react";

const Biography = ({imageUrl}) => {
  return (
    <>
      <div className="container biography">
        <div className="banner">
          <img src={imageUrl} alt="whoweare" />
        </div>
        <div className="banner">
          <p>Biography</p>
          <h3>Who We Are</h3>
          <p>
          AADICARE is an autonomous professional organization 
          consisting of highly qualified and experienced Experts
           and faculty in hospital & health systems operations management,
            public health and multispecialty facilities planning & architectural
             designing doyens, Quality management in health care delivery systems 
             (NABH, NQAS & NABL) experts, public health strategists etc. AADICARE 
             has a large panel of academia, experts in Bio-Medical Engineers, 
             Bio-Medical Waste Management.
          </p>
          <p>Health IT professionals, HTA, Telemedicine, Medical & Wellness tourism,</p>
          <p>Lean & Six Sigma, and other allied fields in health related domains.</p>
          <p>
          In 1984, at Department of Hospital Administration,  
          All India Institute of Medical Sciences, New Delhi,
           a group of highly dedicated visionaries, 
           health systems academia decided to form an organization, 
           which could carry out health system management development,
           training, conduct post graduate courses, professional consultancy.
           
          </p>
          
          <p> This led to birth of first and the only 
            ‘Academy of Hospital Administration’ in India in 1987.</p>
        </div>
      </div>
    </>
  );
};

export default Biography;
