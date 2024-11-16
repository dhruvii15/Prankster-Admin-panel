import React, { useEffect, useState } from 'react';
import { Button, Table, Pagination } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { faCheck } from '@fortawesome/free-solid-svg-icons';

// img
import logo from "../../assets/images/logo.svg";

const UserVideo = () => {
    const [loading, setLoading] = useState(true);
    const [filteredData, setFilteredData] = useState([]);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    const getData = () => {
        setLoading(true);
        axios.post('http://localhost:5000/api/users/read', { TypeId: "2" })
            .then((res) => {
                const newData = res.data.data.reverse();
                setFilteredData(newData); // Set filtered data initially to all data
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
    }, []);

    const handlePlusClick = (video) => {
        const formData = new FormData();
        formData.append('VideoName', video.VideoName);
        formData.append('Video', video.Video);
        formData.append('VideoPremium', false);
        formData.append('VideoImage', 'https://pslink.world/api/public/images/video.jpg');
        formData.append('Hide', false);
        formData.append('role', video._id);


        if (window.confirm("Are you sure you want to move this Video?")) {
            axios.post('http://localhost:5000/api/video/create', formData)
                .then((res) => {
                    getData();
                    toast.success(res.data.message);
                })
                .catch((err) => {
                    console.error(err);
                    toast.error("An error occurred. Please try again.");
                });
        }
    };

    // Pagination logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const renderPaginationItems = () => {
        let items = [];
        const totalPagesToShow = 8;

        let startPage = Math.max(1, currentPage - Math.floor(totalPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + totalPagesToShow - 1);

        if (endPage - startPage < totalPagesToShow - 1) {
            startPage = Math.max(1, endPage - totalPagesToShow + 1);
        }

        // Add pagination items
        for (let i = startPage; i <= endPage; i++) {
            items.push(
                <Pagination.Item
                    key={i}
                    active={i === currentPage}
                    onClick={() => paginate(i)}
                >
                    {i}
                </Pagination.Item>
            );
        }

        return items;
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
                animation: "1.2s ease-out infinite zoom-in-zoom-out2",
                width: "200px"
            }} />
        </div>
    );

    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center pb-5'>
                <div>
                    <h4>Video </h4>
                    <p>User / Video Management</p>
                </div>
            </div>

            <Table striped bordered hover responsive className='text-center fs-6'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Video Name</th>
                        <th>Video</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {currentItems && currentItems.length > 0 ? (
                        currentItems.map((video, index) => (
                            <tr key={video._id} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td>{indexOfFirstItem + index + 1}</td>
                                <td>{video.VideoName}</td>
                                <td>
                                    <video controls width="240">
                                        <source src={video.Video} type="video/mp4" />
                                        <track
                                            kind="captions"
                                            src={video.VideoName}
                                            srcLang="en"
                                            label="English"
                                            default
                                        />
                                        Your browser does not support the video element.
                                    </video>
                                </td>
                                <td>
                                    <Button
                                        className='bg-transparent border-0 fs-4'
                                        style={{ color: "#0385C3" }}
                                        onClick={() => handlePlusClick(video)}
                                    >
                                        <FontAwesomeIcon icon={faCheck} />
                                    </Button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4} className="text-center">No Data Found</td>
                        </tr>
                    )}
                </tbody>
            </Table>

            {totalPages > 1 && (
                <div className='d-flex justify-content-center'>
                    <Pagination>
                        {renderPaginationItems()}
                    </Pagination>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default UserVideo;