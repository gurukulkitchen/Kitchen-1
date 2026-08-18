'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

const CompanyContext = createContext();

export function CompanyProvider({ children }) {
    const [selectedCompanyIds, setSelectedCompanyIds] = useState(() => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem('selectedCompanyIds');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (Array.isArray(parsed) && parsed.length > 0) return parsed;
            } catch (e) {}
        }
        const single = localStorage.getItem('selectedCompanyId');
        return single ? [single] : [];
    });
    const [assignedCompanies, setAssignedCompanies] = useState(() => {
        if (typeof window === 'undefined') return [];
        const stored = localStorage.getItem('assignedCompanies');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                return [];
            }
        }
        return [];
    });
    const [companyName, setCompanyName] = useState(() => {
        if (typeof window === 'undefined') return 'All Assigned Companies';
        return localStorage.getItem('companyName') || 'All Assigned Companies';
    });
    const [companyAddress, setCompanyAddress] = useState(() => {
        if (typeof window === 'undefined') return '';
        return localStorage.getItem('companyAddress') || '';
    });
    const [companyPhone, setCompanyPhone] = useState(() => {
        if (typeof window === 'undefined') return '';
        return localStorage.getItem('companyPhone') || '';
    });
    const hasInitializedSelection = useRef(false);
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    // Computed states
    const isReadOnly = selectedCompanyIds.length !== 1;

    const syncCompanyName = useCallback(async (ids) => {
        if (!ids || ids.length === 0) {
            setCompanyName('All Assigned Companies');
            localStorage.setItem('companyName', 'All Assigned Companies');
            setCompanyAddress('');
            localStorage.removeItem('companyAddress');
            setCompanyPhone('');
            localStorage.removeItem('companyPhone');
            localStorage.removeItem('selectedCompanyId');
            return;
        }

        if (ids.length > 1) {
            try {
                const res = await fetch('/api/companies');
                if (res.ok) {
                    const allCompanies = await res.json();
                    const names = ids.map(id => {
                        const comp = allCompanies.find((c) => {
                            const companyId = String(c?._id?.$oid || c?._id || '');
                            const targetId = String(id?.$oid || id || '');
                            return companyId === targetId;
                        });
                        return comp ? comp.name : null;
                    }).filter(Boolean);

                    if (names.length > 0) {
                        const label = names.join(' & ');
                        setCompanyName(label);
                        localStorage.setItem('companyName', label);
                        setCompanyAddress('');
                        localStorage.removeItem('companyAddress');
                        setCompanyPhone('');
                        localStorage.removeItem('companyPhone');
                        localStorage.removeItem('selectedCompanyId');
                        return;
                    }
                }
            } catch (error) {
                console.error('Failed to fetch multiple company names:', error);
            }

            const label = `Multiple Companies (${ids.length})`;
            setCompanyName(label);
            localStorage.setItem('companyName', label);
            setCompanyAddress('');
            localStorage.removeItem('companyAddress');
            setCompanyPhone('');
            localStorage.removeItem('companyPhone');
            localStorage.removeItem('selectedCompanyId');
            return;
        }

        const selectedId = ids[0];
        localStorage.setItem('selectedCompanyId', selectedId);

        try {
            const res = await fetch('/api/companies');
            const companies = await res.json();
            const selectedCompany = Array.isArray(companies)
                ? companies.find((company) => {
                    const companyId = String(company?._id?.$oid || company?._id || '');
                    const targetId = String(selectedId?.$oid || selectedId || '');
                    return companyId === targetId;
                })
                : null;

            if (selectedCompany?.name) {
                setCompanyName(selectedCompany.name);
                localStorage.setItem('companyName', selectedCompany.name);
                setCompanyAddress(selectedCompany.address || '');
                localStorage.setItem('companyAddress', selectedCompany.address || '');
                setCompanyPhone(selectedCompany.mobileNumber || '');
                localStorage.setItem('companyPhone', selectedCompany.mobileNumber || '');
                return;
            }
        } catch (error) {
            console.error('Failed to sync selected company name:', error);
        }

        setCompanyName('Selected Company');
        localStorage.setItem('companyName', 'Selected Company');
    }, []);

    const updateUrl = useCallback((ids) => {
        const params = new URLSearchParams(searchParams);
        if (ids.length > 0) {
            params.set('companyId', ids.join(','));
        } else {
            params.delete('companyId');
        }
        const nextQuery = params.toString();
        const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;
        const currentQuery = searchParams.toString();
        const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;

        if (nextUrl !== currentUrl) {
            router.replace(nextUrl);
        }
    }, [pathname, router, searchParams]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    const user = data.user || data;

                    if (user.role === 'Super Admin') {
                        const compRes = await fetch('/api/companies');
                        if (compRes.ok) {
                            const allComps = await compRes.json();
                            const companyIds = allComps.map(c => c._id);
                            setAssignedCompanies(companyIds);
                            localStorage.setItem('assignedCompanies', JSON.stringify(companyIds));
                        }
                    } else if (user.assignedCompanies && user.assignedCompanies.length > 0) {
                        setAssignedCompanies(user.assignedCompanies);
                        localStorage.setItem('assignedCompanies', JSON.stringify(user.assignedCompanies));
                    } else if (user.companyId) {
                        const ids = [user.companyId];
                        setAssignedCompanies(ids);
                        localStorage.setItem('assignedCompanies', JSON.stringify(ids));
                    }
                }
            } catch (error) {
                console.error('Failed to fetch user companies:', error);
            }
        };

        const isPublicPage = pathname === '/login' || pathname === '/register';
        if (!isPublicPage) {
            fetchUserData();
        }
    }, [pathname]);

    useEffect(() => {
        const companyIdsFromUrl = searchParams.get('companyId');
        if (companyIdsFromUrl) {
            const ids = companyIdsFromUrl.split(',').filter(Boolean);
            setSelectedCompanyIds(ids);
        }
        hasInitializedSelection.current = true;
    }, [searchParams]);

    useEffect(() => {
        if (!hasInitializedSelection.current) return;

        localStorage.setItem('selectedCompanyIds', JSON.stringify(selectedCompanyIds));
        updateUrl(selectedCompanyIds);
        setTimeout(() => {
            syncCompanyName(selectedCompanyIds);
        }, 0);
    }, [selectedCompanyIds, syncCompanyName, updateUrl]);

    // Auto-select if only one company is assigned and no selection is active
    useEffect(() => {
        if (assignedCompanies.length === 1 && selectedCompanyIds.length === 0 && !searchParams.get('companyId')) {
            const onlyId = (assignedCompanies[0]?.$oid || assignedCompanies[0]).toString();
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setSelectedCompanyIds([onlyId]);
        }
    }, [assignedCompanies, selectedCompanyIds, searchParams]);

    const toggleCompanyId = (id) => {
        const targetId = String(id?.$oid || id || '');
        if (!targetId) return;
        
        setSelectedCompanyIds(prev => {
            const stringifiedPrev = prev.map(p => String(p?.$oid || p || ''));
            return stringifiedPrev.includes(targetId)
                ? stringifiedPrev.filter(i => i !== targetId)
                : [...stringifiedPrev, targetId];
        });
    };

    const selectSingleCompany = (id) => {
        const targetId = String(id?.$oid || id || '');
        if (!targetId) {
            setSelectedCompanyIds([]);
            return;
        }
        setSelectedCompanyIds([targetId]);
    };

    const selectCompany = (id) => {
        selectSingleCompany(id);
    };

    return (
        <CompanyContext.Provider value={{
            selectedCompanyId: selectedCompanyIds[0] || '',
            selectedCompanyIds,
            assignedCompanies,
            companyName,
            selectCompany,
            toggleCompanyId,
            selectSingleCompany,
            isReadOnly,
            companyAddress,
            companyPhone
        }}>
            {children}
        </CompanyContext.Provider>
    );
}

export function useCompany() {
    return useContext(CompanyContext);
}
