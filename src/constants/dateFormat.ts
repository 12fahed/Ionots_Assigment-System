const dateFormat = (date: number | Date): string => {
    const timestamp = typeof date === 'number' ? date * 1000 : date.getTime();
    const dateObj = new Date(timestamp);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
}

export { dateFormat };