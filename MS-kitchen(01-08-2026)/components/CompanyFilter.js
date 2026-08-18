'use client';

import { useState, useEffect } from 'react';
import { Building2, Filter } from 'lucide-react';
import { useCompany } from '../context/CompanyContext';

export default function CompanyFilter() {
    const { selectedCompanyId, selectCompany } = useCompany();
    const [companies, setCompanies] = useState([]);
    const isSuperAdmin = typeof window !== 'undefined' && localStorage.getItem('role') === 'Super Admin';

    const fetchCompanies = async () => {
        try {
            const res = await fetch('/api/companies');
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    // Only show active companies in the filter
                    const activeCompanies = data.filter(c => c.status !== 'inactive');
                    setCompanies(activeCompanies);
                }
            }
        } catch (error) {
            console.error('Failed to fetch companies for filter', error);
        }
    };

    useEffect(() => {
        if (isSuperAdmin) {
            setTimeout(() => {
                fetchCompanies();
            }, 0);
        }
    }, [isSuperAdmin]);

    const handleChange = (e) => {
        const companyId = e.target.value;
        selectCompany(companyId);
    };

    if (!isSuperAdmin) return null;

    return (
        <div className="flex items-center gap-2 bg-card p-2 rounded-xl border border-border shadow-sm group">
            <div className="p-2 bg-muted rounded-lg text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                <Filter size={16} />
            </div>
            <div className="relative">
                <select
                    value={selectedCompanyId}
                    onChange={handleChange}
                    className="appearance-none bg-transparent py-1 pr-8 pl-1 text-sm font-bold text-foreground outline-none cursor-pointer min-w-[150px] transition-colors hover:text-primary"
                >
                    <option value="">All Companies</option>
                    {companies.map(company => (
                        <option key={company._id} value={company._id}>
                            {company.name}
                        </option>
                    ))}
                </select>
                <div className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground group-hover:text-primary transition-colors">
                    <Building2 size={14} />
                </div>
            </div>
        </div>
    );
}
