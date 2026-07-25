const generateId = (): string => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    return Array.from({ length: 8 }, () => 
        letters[Math.floor(Math.random() * letters.length)]
    ).join('');
};

export default generateId