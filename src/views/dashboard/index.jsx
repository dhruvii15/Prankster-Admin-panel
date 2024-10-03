import React, { useEffect, useMemo, useState } from 'react';
import { Row, Col, Table, Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInbox, faUser } from '@fortawesome/free-solid-svg-icons';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend } from 'chart.js';
import axios from 'axios';


// img
import logo from "../../assets/images/logo.svg";
import { faAppStore } from '@fortawesome/free-brands-svg-icons';
import { faImage } from '@fortawesome/free-regular-svg-icons';


// Register necessary Chart.js components
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend);

const DashAnalytics = () => {

  const [users, setData] = useState([]);
  const [moreapp, setData2] = useState([]);
  const [inbox, setData3] = useState([]);
  const [cardbackground, setData4] = useState([]);
  const [cardTitle, setData5] = useState([]);
  const [loading, setLoading] = useState(true);

  const getData = () => {
    setLoading(true);
    axios.get('https://lolcards.link/api/user')
      .then((res) => {
        setData(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const getData2 = () => {
    setLoading(true);
    axios.post('https://lolcards.link/api/moreApp/read')
      .then((res) => {
        setData2(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const getData3 = () => {
    axios.post('https://lolcards.link/api/inbox/readadmin', { username: 'admin' })
      .then((res) => {
        setData3(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const getData4 = () => {
    axios.post('https://lolcards.link/api/cardBackground/read')
      .then((res) => {
        setData4(res.data.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };


  const getData5 = () => {
    setLoading(true);
    axios.post('https://lolcards.link/api/cardTitle/read')
        .then((res) => {
            setData5(res.data.data);
            setLoading(false);
        })
        .catch((err) => {
            console.error(err);
            setLoading(false);
            toast.error("Failed to fetch data.");
        });
};

  useEffect(() => {
    getData();
    getData2();
    getData3();
    getData4();
    getData5();
  }, []);



  // Process data to count users per day
  const processData = (users) => {
    const userCountByDate = {};

    users.forEach(user => {
      const date = new Date(user.createdAt);

      // Check if the date is valid
      if (isNaN(date.getTime())) {
        return; // Skip invalid dates
      }

      const formattedDate = `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`; // MM/DD/YYYY format

      if (userCountByDate[formattedDate]) {
        userCountByDate[formattedDate]++;
      } else {
        userCountByDate[formattedDate] = 1;
      }
    });

    const labels = Object.keys(userCountByDate);
    const data = Object.values(userCountByDate);

    return { labels, data };
  };

  // Usage
  const { labels, data } = useMemo(() => processData(users), [users]);


  // Chart.js data configuration
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Users Created per Day',
        data,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.1,
      },
    ],
  };

  if (loading) return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: "hidden"
      }}
    >
      <img src={logo} alt='loading....' style={{
        animation: "1.2s ease-out infinite zoom-in-zoom-out2", width: "200px"
      }} />
    </div>
  );

  return (
    <React.Fragment>
      <Row className='p-3'>
        {/* user Card */}
        <Col md={6} xl={3} className='my-3'>
          <Card className="bg-c-blue">
            <Card.Body>
              <h6 className="text-white fs-6">User</h6>
              <h2 className="text-end text-white d-flex justify-content-between">
                <FontAwesomeIcon icon={faUser} />
                <span>{users.length}</span>
              </h2>
            </Card.Body>
          </Card>
        </Col>
        {/* more app Card */}
        <Col md={6} xl={3} className='my-3'>
          <Card className="bg-c-purple">
            <Card.Body>
              <h6 className="text-white fs-6">More App</h6>
              <h2 className="text-end text-white d-flex justify-content-between">
                <FontAwesomeIcon icon={faAppStore} />
                <span>{moreapp.length}</span>
              </h2>
            </Card.Body>
          </Card>
        </Col>
        {/* inbox Card */}
        <Col md={6} xl={3} className='my-3'>
          <Card className="bg-c-yellow">
            <Card.Body>
              <h6 className="text-white fs-6">Inbox</h6>
              <h2 className="text-end text-white d-flex justify-content-between">
                <FontAwesomeIcon icon={faInbox} />
                <span>{inbox.length}</span>
              </h2>
            </Card.Body>
          </Card>
        </Col>
        <Col md={6} xl={3} className='my-3'>
          <Card className="bg-c-green">
            <Card.Body>
              <h6 className="text-white fs-6">Cover</h6>
              <h2 className="text-end text-white d-flex justify-content-between">
                <FontAwesomeIcon icon={faImage} />
                <span>{cardbackground.length}</span>
              </h2>
            </Card.Body>
          </Card>
        </Col>
        {/* Line Chart */}
        <Col lg={8} className='my-4'>
          <div className='bg-white rounded-3 p-3'>
            <h3 className='text-primary'>User Creation Trend:</h3>
            <Line data={chartData} />
          </div>
        </Col>
        {/* More App */}
        <Col lg={4} className='my-4 bg-white p-3'>
          <h3 className='text-primary'>More Apps:</h3>
          {moreapp.slice(-4).map((app) => (
            <div key={app._id} className='mt-3 p-2 rounded-3 shadow-sm d-flex align-items-center'>
              <img src={app.logo} alt={app.enAppName} width={60} />
              <p className='m-0 ps-3'>{app.enAppName}</p>
            </div>
          ))}
        </Col>
        {/* Recent Hiring Table */}
        <Col md={12} className='my-4 overflow-auto bg-white'>
          <div className='rounded-3 p-3'>
            <h3 className='text-primary'>Card Title :</h3>
            <Table>
              <thead>
                <tr>
                  <th>Id</th>
                  <th>English</th>
                  <th>Hindi</th>
                  <th>Spanish</th>
                  <th>Urdu</th>
                  <th>French</th>
                </tr>
              </thead>
              <tbody>
                {cardTitle.slice(-6).map((row , id) => (
                  <tr key={row._id}>
                    <td>{id + 1}</td>
                    <td>{row.eng}</td>
                    <td>{row.hindi}</td>
                    <td>{row.spanish}</td>
                    <td>{row.urdu}</td>
                    <td>{row.french}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Col>
      </Row>
    </React.Fragment>
  );
};

export default DashAnalytics;
