import React, { useState, useEffect } from 'react';
import { Album, Check, Trash2, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {BASE_URL} from '../utils/vars'
const Lent = () => {
    const [approvedRequests, setApprovedRequests] = useState([]);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Fetch approved requests
    const fetchApprovedRequests = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/v1/borrow/approved`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });
            setApprovedRequests(response.data.requests);
        } catch (err) {
            console.error('Error fetching approved requests:', err);
            setError(err.message);
        }
    };

    // Fetch pending requests
    const fetchPendingRequests = async () => {
        try {
            const response = await axios.get(`${BASE_URL}/api/v1/borrow/pending`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
            }
            });
            setPendingRequests(response.data.requests);
        } catch (err) {
            console.error('Error fetching pending requests:', err);
            setError(err.message);
        }
    };

    // Initial data fetch
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([fetchApprovedRequests(), fetchPendingRequests()]);
            setLoading(false);
        };
        
        loadData();
    }, []);

    // Handle marking book as returned
    const handleReturnBook = async (requestId) => {
        try {
            const response = await axios.post(
            `${BASE_URL}/api/v1/borrow/confirm-return/${requestId}`,
            {},
            {
                headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                'Content-Type': 'application/json'
                }
            }
            );

            if (response.status !== 200) {
            throw new Error('Failed to mark book as returned');
            }

            // Remove from approved requests
            setApprovedRequests(prev => prev.filter(req => req._id !== requestId));
        } catch (err) {
            console.error('Error marking book as returned:', err);
            alert('Failed to mark book as returned');
        }
    };

    // Handle accepting request
    const handleAcceptRequest = async (requestId) => {
        try {
            const response = await axios.post(
                `${BASE_URL}/api/v1/borrow/respond/accept/${requestId}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status !== 200) {
                throw new Error('Failed to accept request');
            }

            // Move from pending to approved
            const acceptedRequest = pendingRequests.find(req => req._id === requestId);
            if (acceptedRequest) {
                setPendingRequests(prev => prev.filter(req => req._id !== requestId));
                setApprovedRequests(prev => [...prev, { ...acceptedRequest, status: 'approved' }]);
            }
        } catch (err) {
            console.error('Error accepting request:', err);
            alert('Failed to accept request');
        }
    };

    // Handle rejecting request
    const handleRejectRequest = async (requestId) => {
        try {
            const response = await axios.post(
                `${BASE_URL}/api/v1/borrow/respond/reject/${requestId}`,
                {},
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status !== 200) {
                throw new Error('Failed to reject request');
            }

            // Remove from pending requests
            setPendingRequests(prev => prev.filter(req => req._id !== requestId));
        } catch (err) {
            console.error('Error rejecting request:', err);
            alert('Failed to reject request');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY format
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FCF8F5] p-4 md:p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg text-gray-600">Loading...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#FCF8F5] p-4 md:p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-center items-center h-64">
                        <div className="text-lg text-red-600">Error: {error}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FCF8F5] p-4 md:p-6">
            {/* Header */}
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl md:text-3xl font-semibold">
                        <Link to={'/book/borrow'} className="text-gray-600 hover:text-[#9883D5] transition-colors">
                            Borrowed
                        </Link>
                        <span className="text-gray-400 mx-2">/</span>
                        <Link to={'/book/lent'} className="text-[#9883D5] hover:text-[#8571c7] transition-colors">
                            Lent
                        </Link>
                    </h1>
                </div>

                {/* Books Lent Section - Approved Requests */}
                <div className="mb-8">
                    <h3 className="text-xl md:text-2xl font-medium mb-4">Books Lent</h3>
                    <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                        {approvedRequests.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No books currently lent out
                            </div>
                        ) : (
                            approvedRequests.map((request) => (
                                <div
                                    key={request._id}
                                    className="bg-white min-h-[80px] w-full rounded-lg flex flex-col md:flex-row items-center justify-between p-4 shadow-sm border border-gray-200"
                                >
                                    <div className="w-full md:w-[40%] mb-2 md:mb-0">
                                        <h2 className="text-lg font-semibold text-gray-800">
                                            {request.fromUser?.name || 'Unknown User'}
                                        </h2>
                                        <div className="flex items-center text-gray-600 text-sm">
                                            <User size={16} className="mr-1" />
                                            {request.fromUser?.email || 'No email'}
                                        </div>
                                    </div>

                                    <div className="w-full md:w-[30%] text-gray-600 font-medium text-base md:text-lg mb-2 md:mb-0">
                                        {request.book?.title || 'Unknown Book'}
                                    </div>

                                    <div className="w-full md:w-[30%] flex justify-end">
                                        <button
                                            onClick={() => handleReturnBook(request._id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-[#34A353] text-white rounded-lg text-sm font-medium hover:bg-green-600 transition-all"
                                        >
                                            Returned
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Book Requests Section - Pending Requests */}
                <div>
                    <h3 className="text-xl md:text-2xl font-medium mb-4">Book Requests</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
                        {pendingRequests.length === 0 ? (
                            <div className="col-span-full text-center py-8 text-gray-500">
                                No pending requests
                            </div>
                        ) : (
                            pendingRequests.map((request) => (
                                <div
                                    key={request._id}
                                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 flex flex-col h-full"
                                >
                                    {/* Book Icon & Title */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <Album size={24} className="text-[#9883D5]" />
                                        <h3 className="text-lg font-semibold">
                                            {request.book?.title || 'Unknown Book'}
                                        </h3>
                                    </div>

                                    {/* Borrower */}
                                    <p className="text-gray-700 text-sm mb-2">
                                        <span className="font-medium">Borrower:</span> {request.fromUser?.name || 'Unknown User'}
                                    </p>

                                    {/* Email */}
                                    <p className="text-gray-600 text-xs mb-4">
                                        {request.fromUser?.email || 'No email'}
                                    </p>

                                    {/* Request Date */}
                                    <p className="text-gray-600 text-xs mb-4">
                                        <span className="font-medium">Requested:</span> {formatDate(request.createdAt)}
                                    </p>

                                    {/* Action Buttons */}
                                    <div className="flex gap-3 mt-auto">
                                        <button 
                                            onClick={() => handleRejectRequest(request._id)}
                                            className="flex-1 bg-red-500 text-white py-2 px-3 rounded-lg hover:bg-red-600 text-sm"
                                        >
                                            Reject
                                        </button>
                                        <button 
                                            onClick={() => handleAcceptRequest(request._id)}
                                            className="flex-1 bg-green-500 text-white py-2 px-3 rounded-lg hover:bg-green-600 text-sm"
                                        >
                                            Accept
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lent;