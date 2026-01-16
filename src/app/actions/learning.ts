'use server'

import { prisma } from '@/lib/prisma'
import { getCurrentEmployee } from './employee-portal'
import { revalidatePath } from 'next/cache'

export async function getCourses() {
    try {
        const courses = await prisma.course.findMany({
            where: {
                isPublished: true
            },
            include: {
                _count: {
                    select: { lessons: true }
                }
            },
            orderBy: {
                order: 'asc'
            }
        })
        return { success: true, data: courses }
    } catch (error) {
        console.error('Error fetching courses:', error)
        return { success: false, error: 'Failed to fetch courses' }
    }
}

export async function getCourseContent(courseId: string) {
    try {
        const employee = await getCurrentEmployee()
        if (!employee) return { success: false, error: 'Unauthorized' }

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                lessons: {
                    orderBy: { order: 'asc' },
                    include: {
                        quiz: true
                    }
                }
            }
        })

        if (!course) return { success: false, error: 'Course not found' }

        // Get student progress
        const certificate = await prisma.certificate.findFirst({
            where: {
                courseId,
                employeeId: employee.id
            }
        })

        return { success: true, data: { course, completed: !!certificate, certificate } }
    } catch (error) {
        console.error('Error fetching course content:', error)
        return { success: false, error: 'Failed to fetch course content' }
    }
}

export async function submitQuizAttempt(quizId: string, answers: any, score: number, passed: boolean) {
    try {
        const employee = await getCurrentEmployee()
        if (!employee) return { success: false, error: 'Unauthorized' }

        const attempt = await prisma.quizAttempt.create({
            data: {
                quizId,
                employeeId: employee.id,
                answers: JSON.stringify(answers),
                score,
                passed
            }
        })

        return { success: true, data: attempt }

    } catch (error) {
        console.error('Error submitting quiz:', error)
        return { success: false, error: 'Failed to submit quiz' }
    }
}

export async function generateCertificate(courseId: string) {
    try {
        const employee = await getCurrentEmployee()
        if (!employee) return { success: false, error: 'Unauthorized' }

        const existingCert = await prisma.certificate.findFirst({
            where: { courseId, employeeId: employee.id }
        })

        if (existingCert) return { success: true, data: existingCert }

        const certificate = await prisma.certificate.create({
            data: {
                courseId,
                employeeId: employee.id,
                certificateNumber: `CERT-${Date.now()}-${Math.floor(Math.random() * 1000)}`
            }
        })

        revalidatePath('/portal/learning')
        return { success: true, data: certificate }
    } catch (error) {
        console.error('Error generating certificate:', error)
        return { success: false, error: 'Failed to generate certificate' }
    }
}

export async function createCourse(data: {
    title: string;
    description: string;
    category: string;
    duration: number;
    imageUrl?: string;
    videoUrl?: string;
    isPublished?: boolean;
}) {
    try {
        const course = await prisma.course.create({
            data: {
                title: data.title,
                description: data.description,
                category: data.category,
                duration: data.duration,
                imageUrl: data.imageUrl,
                videoUrl: data.videoUrl,
                isPublished: data.isPublished || false
            }
        })

        revalidatePath('/admin/courses')
        revalidatePath('/portal/learning')

        return { success: true, data: course }
    } catch (error) {
        console.error('Error creating course:', error)
        return { success: false, error: 'Failed to create course' }
    }
}

export async function submitExternalCertificate(data: {
    title: string;
    issuer: string;
    completionDate: Date;
    fileUrl?: string;
}) {
    try {
        const employee = await getCurrentEmployee()
        if (!employee) return { success: false, error: 'Unauthorized' }

        const cert = await prisma.externalCertificate.create({
            data: {
                employeeId: employee.id,
                title: data.title,
                issuer: data.issuer,
                completionDate: data.completionDate,
                fileUrl: data.fileUrl,
                status: 'PENDING'
            }
        })

        revalidatePath('/portal/learning')
        return { success: true, data: cert }
    } catch (error) {
        console.error('Error submitting external cert:', error)
        return { success: false, error: 'Failed to submit certificate' }
    }
}

export async function deleteCourse(courseId: string) {
    try {
        await prisma.course.delete({
            where: { id: courseId }
        })

        revalidatePath('/admin/courses')
        revalidatePath('/portal/learning')
        return { success: true }
    } catch (error) {
        console.error('Error deleting course:', error)
        return { success: false, error: 'Failed to delete course' }
    }
}

export async function toggleCoursePublish(courseId: string, isPublished: boolean) {
    try {
        await prisma.course.update({
            where: { id: courseId },
            data: { isPublished }
        })

        revalidatePath('/admin/courses')
        revalidatePath('/portal/learning')
        return { success: true }
    } catch (error) {
        console.error('Error toggling course publish status:', error)
        return { success: false, error: 'Failed to update course status' }
    }
}
