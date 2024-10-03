import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import 'react-toastify/dist/ReactToastify.css';
import { Col, Container, Row, ButtonGroup, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

import fontBg1 from "../../assets/images/1.png";
import fontBg2 from "../../assets/images/2.png";
import fontBg3 from "../../assets/images/3.png";
import fontBg4 from "../../assets/images/4.png";
import fontBg5 from "../../assets/images/5.png";

const capitalizeFirstLetter = (string) => {
    if (!string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1);
};

const InboxPage = () => {
    const fontArray = ['BunnyFunny', 'CCKillJoy', 'Pure', 'SHOWG', 'Spider'];
    const colorArray = ['#4D5D53', '#0D9494', '#CC8899', '#F1C40F', '#42B3AE'];
    const shapeArray = ['circle', 'square', 'heptagon'];
    const fontBgImages = [fontBg1, fontBg2, fontBg3, fontBg4, fontBg5];

    const [tableData, setTableData] = useState([]);
    const [randomAttributes, setRandomAttributes] = useState([]);

    const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];

    const fetchTableData = () => {
        axios.post('https://lolcards.link/api/inbox', { username: 'admin' })
            .then((res) => {
                if (!res.data.data || res.data.data.length === 0) {
                    toast.warning('No data available');
                    setTableData([]);
                    setRandomAttributes([]);
                    return;
                }

                setTableData(res.data.data);

                const attributes = res.data.data.map(() => ({
                    fontBg: getRandomElement(fontBgImages),
                    font: getRandomElement(fontArray),
                    color: getRandomElement(colorArray),
                    shape: getRandomElement(shapeArray)
                }));
                setRandomAttributes(attributes);
            })
            .catch((err) => {
                console.error('Failed to fetch table data', err);
                toast.error('Failed to fetch data');
            });
    };


    useEffect(() => {
        fetchTableData();
    }, []);

    const handleDelete = (id) => {
        if (window.confirm("Are you sure you want to delete this ad?")) {
            axios.post('https://lolcards.link/api/inbox/delete', {
                inboxId: id,
                username: 'admin'
            })
                .then(() => {
                    toast.success('Card deleted successfully');
                    setTableData(tableData.filter(card => card.id !== id));
                })
                .catch(err => {
                    console.error('Failed to delete card', err);
                    toast.error('Failed to delete card');
                });
        }
    };


    return (
        <Container className="mt-4">
            <Row className='d-flex justify-content-center align-items-center'>
                {tableData.map((item, index) => {
                    const { fontBg, font, color, shape } = randomAttributes[index] || {};
                    return (
                        <Col xs={12} sm={6} md={4} xl={3} key={item.id} className='text-center'>
                            <div
                                className="shadow rounded-3 mt-3 mx-auto position-relative"
                                style={{
                                    width: "250px",
                                    height: "380px",
                                    backgroundImage: `url(${item.bgUrl})`,
                                    backgroundRepeat: "no-repeat",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center"
                                }}
                            >
                                {/* Edit and Delete Buttons */}
                                <ButtonGroup className="position-absolute top-0 end-0 m-2">
                                    {/* <Button variant="light" size="sm" onClick={() => handleEdit(item._id)}>
                                        <FontAwesomeIcon icon={faEdit} />
                                    </Button> */}
                                    <Button size="sm" onClick={() => handleDelete(item._id)} className='bg-white border-0'>
                                        <FontAwesomeIcon icon={faTrash} className='text-danger px-1' />
                                    </Button>
                                </ButtonGroup>

                                <div className='py-2 text-center'>
                                    <div className='mx-auto d-flex justify-content-center align-items-center text-center'
                                        style={{
                                            width: "170px",
                                            height: "80px",
                                            backgroundImage: `url(${fontBg})`,
                                            backgroundRepeat: "no-repeat",
                                            backgroundSize: "contain",
                                            backgroundPosition: "center"
                                        }}
                                    >
                                        <p className={`${font} ps-2 fw-bold`} style={{ color: color }}>{item.nickname}</p>
                                    </div>

                                    <img src={item.avatar} alt='avatar' className={`${shape} my-1`} style={{ width: "50%", height: "auto" }} />
                                    <div className='px-2 pt-2 d-flex justify-content-center align-items-center'>
                                        <div className='bg-white d-flex justify-content-center align-items-center' style={{ height: "125px", width: "95%", borderRadius: "10px" }}>
                                            <Row className="w-100 text-start px-3">
                                                {item.selectedCardTitle.map((value, index) => (
                                                    <React.Fragment key={index}>
                                                        <Col xs={6} className="p-0">
                                                            <p className="mb-2" style={{ fontSize: "10px", fontWeight: "600" }}>
                                                                {capitalizeFirstLetter(value.title)}
                                                            </p>
                                                        </Col>
                                                        <Col xs={6} className="p-0">
                                                            <p className="mb-2" style={{ fontSize: "10px", fontWeight: "600" }}>
                                                                <span className="pe-2 fw-bold">:</span>
                                                                {capitalizeFirstLetter(value.ans)}
                                                            </p>
                                                        </Col>
                                                    </React.Fragment>
                                                ))}
                                            </Row>

                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Col>
                    );
                })}
            </Row>
        </Container>
    );
};

export default InboxPage;
