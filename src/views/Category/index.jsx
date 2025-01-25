import React from 'react';
import { Table } from 'react-bootstrap';
import 'react-toastify/dist/ReactToastify.css';




const Category = () => {

    const data = [
        { CategoryId: 1, CategoryName: 'Trending' },
        { CategoryId: 2, CategoryName: 'Nonveg' },
        { CategoryId: 3, CategoryName: 'Hot' },
        { CategoryId: 4, CategoryName: 'Funny' },
        { CategoryId: 5, CategoryName: 'Horror' },
        { CategoryId: 6, CategoryName: 'Celebrity' }
    ];

    const language = [
        { LanguageId: 1, LanguageName: 'Hindi' },
        { LanguageId: 2, LanguageName: 'English' },
        { LanguageId: 3, LanguageName: 'Marathi' },
        { LanguageId: 4, LanguageName: 'Gujarati' },
        { LanguageId: 5, LanguageName: 'Tamil' },
        { LanguageId: 6, LanguageName: 'Punjabi' }
    ];


    return (
        <div>
            <div className='d-sm-flex justify-content-between align-items-center'>
                <div>
                    <h4>Prank Category</h4>
                </div>
            </div>


            <Table striped bordered hover responsive className='text-center fs-6 mt-5'>
                <thead>
                    <tr>
                        <th>Id</th>
                        <th>Prank Language</th>
                        <th>Prank Category Name</th>
                    </tr>
                </thead>
                <tbody>
                    {language && language.length > 0 ? (
                        language.map((cardBg, index) => (
                            <tr key={index} className={index % 2 === 1 ? 'bg-light2' : ''}>
                                <td>{index + 1}</td>
                                <td>{cardBg.LanguageName}</td>
                                <td>
                                    {data && data.length > 0 ? (
                                        data.map((cardBg, index) => (
                                            <p key={index}>{cardBg.CategoryName}</p>
                                        ))
                                    ) : (
                                        
                                            <p>No Data Found</p>
                                    )}
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={5} className="text-center">No Data Found</td>
                        </tr>
                    )}
                </tbody>
            </Table>

        </div>
    );
};

export default Category;