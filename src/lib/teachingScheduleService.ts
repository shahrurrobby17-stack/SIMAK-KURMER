import { useState, useEffect, useMemo, useCallback } from 'react';
import { WeeklyClassScheduleItem, TeacherProfile, UserAccount } from '../types';
import { initialWeeklyClassSchedules } from '../data/initialData';
import { subscribeToWeeklySchedules } from './firebaseService';
import { auth } from './firebase';

export const SCHEDULE_STORAGE_KEY = 'simak_weekly_class_schedules';
export const SCHEDULE_CLEARED_KEY = 'simak_weekly_class_schedules_cleared';
export const SCHEDULE_UPDATE_EVENT = 'simak_schedules_updated';

export const getDayNameIndonesian = (date: Date = new Date()): string => {
  const dayIndex = date.getDay();
  return ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'][dayIndex];
};

export const getStoredWeeklySchedules = (): WeeklyClassScheduleItem[] => {
  try {
    if (typeof window === 'undefined') return initialWeeklyClassSchedules;
    const isCleared = localStorage.getItem(SCHEDULE_CLEARED_KEY) === 'true';
    if (isCleared) return [];
    const saved = localStorage.getItem(SCHEDULE_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading stored weekly schedules:', e);
  }
  return initialWeeklyClassSchedules;
};

export const saveStoredWeeklySchedules = (schedules: WeeklyClassScheduleItem[]): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedules));
      localStorage.removeItem(SCHEDULE_CLEARED_KEY);
      window.dispatchEvent(new CustomEvent(SCHEDULE_UPDATE_EVENT, { detail: schedules }));
      window.dispatchEvent(new Event('storage'));
    }
  } catch (e) {
    console.warn('Error saving stored weekly schedules:', e);
  }
};

export const fetchRemoteTeachingSchedules = async (): Promise<WeeklyClassScheduleItem[] | null> => {
  try {
    const user = auth.currentUser;
    if (!user) return null;
    const token = await user.getIdToken();
    const res = await fetch('/api/teaching-schedules', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data)) {
        return data;
      }
    }
  } catch (err) {
    // console.warn('Failed to fetch schedules from API:', err);
  }
  return null;
};

interface UseTeachingSchedulesProps {
  teacher?: TeacherProfile;
  currentUser?: UserAccount | null;
  isMasterUser?: boolean;
}

export const useTeachingSchedules = ({
  teacher,
  currentUser,
  isMasterUser = false
}: UseTeachingSchedulesProps) => {
  const [schedules, setSchedules] = useState<WeeklyClassScheduleItem[]>(getStoredWeeklySchedules);

  const todayDayName = useMemo(() => getDayNameIndonesian(), []);

  const refreshSchedules = useCallback(async () => {
    // 1. Check local storage
    const stored = getStoredWeeklySchedules();
    if (stored.length > 0) {
      setSchedules(stored);
    }
    // 2. Fetch API
    const remote = await fetchRemoteTeachingSchedules();
    if (remote && Array.isArray(remote) && remote.length > 0) {
      setSchedules(remote);
      saveStoredWeeklySchedules(remote);
    }
  }, []);

  useEffect(() => {
    refreshSchedules();

    // Subscribe to Firestore weeklyClassSchedules
    const unsub = subscribeToWeeklySchedules((remoteItems) => {
      if (remoteItems && Array.isArray(remoteItems) && remoteItems.length > 0) {
        setSchedules(remoteItems);
        try {
          localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(remoteItems));
        } catch (e) {
          // ignore
        }
      }
    }, '');

    // Listen for custom event or storage changes
    const handleStorageOrCustomEvent = (e: Event) => {
      if (e.type === SCHEDULE_UPDATE_EVENT) {
        const customEvent = e as CustomEvent;
        if (customEvent.detail && Array.isArray(customEvent.detail)) {
          setSchedules(customEvent.detail);
          return;
        }
      }
      const updated = getStoredWeeklySchedules();
      setSchedules(updated);
    };

    window.addEventListener(SCHEDULE_UPDATE_EVENT, handleStorageOrCustomEvent);
    window.addEventListener('storage', handleStorageOrCustomEvent);

    return () => {
      unsub();
      window.removeEventListener(SCHEDULE_UPDATE_EVENT, handleStorageOrCustomEvent);
      window.removeEventListener('storage', handleStorageOrCustomEvent);
    };
  }, [refreshSchedules]);

  const isMaster = Boolean(
    isMasterUser ||
    teacher?.id === 'PROF-ADMIN' ||
    (currentUser && (
      currentUser.role?.toLowerCase().includes('admin') ||
      currentUser.role?.toLowerCase().includes('master') ||
      currentUser.email?.toLowerCase().includes('master') ||
      currentUser.email?.toLowerCase() === 'shahrurrobby17@gmail.com'
    ))
  );

  const teacherName = (teacher?.name || currentUser?.name || '').trim().toLowerCase();

  const mySchedules = useMemo(() => {
    return schedules.filter(s => {
      if (isMaster) return true;
      if (!teacherName) return true;
      const sTeacher = (s.teacher || '').trim().toLowerCase();
      if (!sTeacher) return false;
      return (
        sTeacher === teacherName ||
        (teacher?.id && s.teacher === teacher.id) ||
        (teacherName.length > 3 && sTeacher.includes(teacherName)) ||
        (sTeacher.length > 3 && teacherName.includes(sTeacher))
      );
    });
  }, [schedules, isMaster, teacherName, teacher?.id]);

  const todaySchedules = useMemo(() => {
    return mySchedules.filter(s => (s.day || '').trim().toLowerCase() === todayDayName.toLowerCase());
  }, [mySchedules, todayDayName]);

  const activeClasses = useMemo(() => {
    return Array.from(new Set(todaySchedules.map(s => s.className).filter(Boolean)));
  }, [todaySchedules]);

  const activeClassText = activeClasses.length > 0 
    ? activeClasses.join(', ') 
    : 'Tidak ada jadwal hari ini';

  return {
    schedules,
    mySchedules,
    todaySchedules,
    activeClasses,
    activeClassText,
    todayDayName,
    refreshSchedules
  };
};
