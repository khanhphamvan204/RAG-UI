import React from 'react';
import { Search } from 'lucide-react';

const SearchFilter = ({ searchQuery, setSearchQuery, fileTypeFilter, setFileTypeFilter, fileTypes, setCurrentPage }) => {
    return (
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                        placeholder="Tìm kiếm tài liệu..."
                        className="w-full px-4 py-3 pl-12 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                    />
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                </div>
                <select
                    value={fileTypeFilter}
                    onChange={(e) => {
                        setFileTypeFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 focus:bg-white transition-all duration-200 min-w-[200px]"
                >
                    <option value="">Tất cả loại tài liệu</option>
                    {fileTypes.map((type) => (
                        <option key={type} value={type}>
                            {type}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

export default SearchFilter;