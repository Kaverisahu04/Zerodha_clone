import React from "react";

function Team() {
  return (
    <div className="container">
      <div className="row p-3 mt-5 border-top">
        <h1 className="text-center ">About Me</h1>
      </div>

      <div
        className="row p-3 text-muted"
        style={{ lineHeight: "1.8", fontSize: "1.2em" }}
      >
        <div className="col-6 p-3 text-center">
          <img
            src="/kaveri1.jpg"
            style={{ borderRadius: "50%", width: "250px", height: "250px", objectFit: "cover" }}
          />
          <h4 className="mt-5">Kaveri Sahu</h4>
          <h6>MERN Stack Developer</h6>
        </div>
        <div className="col-6 p-3">
          <p>
            I am a passionate MERN Stack Developer with expertise in
            building scalable web applications. I have a strong foundation in
            JavaScript, React, Node.js, and MongoDB.
          </p>
          <p>
            I enjoys building responsive and user-friendly web applications
            and is continuously learning new technologies.
          </p>
          <p>
            Connect on <a href="https://github.com/Kaverisahu04">Github</a> / <a href="https://www.linkedin.com/in/kaverisahu/">LinkedIn</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Team;