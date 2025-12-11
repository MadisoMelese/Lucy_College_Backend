import prisma from "../config/database.js";

const generateDefaultCode = (name) => {
    const words = name.split(/\s+/).filter(w => w.length > 0);
    let code = '';
    
    if (words.length >= 4) {
        code = words[0][0] + words[1][0] + words[3][0];
    } 
    else if (words.length > 0) {
        code = words[0].substring(0, 4);
    }
    
    return code.toUpperCase();
};

export const findFaculties = async (skip, limit) => {
    const [items, total] = await Promise.all([
        prisma.faculty.findMany({
            skip,
            take: limit,
            include: { departments: true },
            orderBy: { name: 'asc' }
        }),
        prisma.faculty.count(),
    ]);
    return { items, total };
};

export const findFacultyByCode = async (facultyCode) => {
    const faculty = await prisma.faculty.findUnique({
        where: { facultyCode: facultyCode.toUpperCase() },
        include: { departments: true },
    });
    return faculty;
};

export const createFaculty = async (name, inputFacultyCode) => {
    
    let finalFacultyCode;
    
    if (inputFacultyCode) {
        finalFacultyCode = inputFacultyCode.toUpperCase();
    } else {
        finalFacultyCode = generateDefaultCode(name);
    }

    const existingFaculty = await prisma.faculty.findUnique({
        where: { facultyCode: finalFacultyCode },
        select: { id: true }
    });
    
    if (existingFaculty) {
        throw new Error(`Faculty Code ${finalFacultyCode} already exists. Please provide a manual code.`);
    }

    const newFaculty = await prisma.faculty.create({
        data: { 
            name, 
            facultyCode: finalFacultyCode
        },
    });
    return newFaculty;
};

export const updateFacultyByCode = async (existingFacultyCode, updateData) => {
    if (Object.keys(updateData).length === 0) {
        throw new Error("No updatable fields provided.");
    }
    
    if (updateData.facultyCode) {
        updateData.facultyCode = updateData.facultyCode.toUpperCase();
    }

    const faculty = await prisma.faculty.update({
        where: { facultyCode: existingFacultyCode.toUpperCase() },
        data: updateData,
    });
    return faculty;
};

export const deleteFacultyByCode = async (facultyCode) => {
    await prisma.faculty.delete({ 
        where: { facultyCode: facultyCode.toUpperCase() } 
    });
};