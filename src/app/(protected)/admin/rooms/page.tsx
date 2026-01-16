export const dynamic = 'force-dynamic';

import { Metadata } from 'next'
import Link from 'next/link'
import { Plus, MapPin, Users, Monitor, Wifi, Edit, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getAdminMeetingRooms, deleteMeetingRoom } from '@/app/actions/admin-rooms'
import { DeleteRoomButton } from './delete-room-button'
import { PremiumPageHeader } from "@/components/ui/premium-page-header"

export const metadata: Metadata = {
    title: 'إدارة قاعات الاجتماعات | لوحة التحكم',
}

export default async function AdminRoomsPage() {
    const result = await getAdminMeetingRooms()
    const rooms = result.success ? result.data : []

    return (
        <div className="container mx-auto p-6 space-y-6" dir="rtl">
            <PremiumPageHeader
                title="قاعات الاجتماعات"
                description="إدارة قاعات الاجتماعات وتجهيزاتها"
                icon={MapPin}
                rightContent={
                    <Link href="/admin/rooms/new">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            إضافة قاعة جديدة
                        </Button>
                    </Link>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {rooms?.map((room) => (
                    <Card key={room.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-xl mb-1">{room.name}</CardTitle>
                                    <div className="flex items-center text-sm text-muted-foreground gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {room.location} {room.floor && `- ${room.floor}`}
                                    </div>
                                </div>
                                <Badge variant={room.isActive ? 'default' : 'secondary'}>
                                    {room.isActive ? 'نشط' : 'غير نشط'}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <Badge variant="outline" className="gap-1">
                                        <Users className="h-3 w-3" />
                                        {room.capacity} شخص
                                    </Badge>
                                    {room.hasProjector && (
                                        <Badge variant="outline" className="gap-1">
                                            <Monitor className="h-3 w-3" />
                                            بروجكتور
                                        </Badge>
                                    )}
                                    {room.hasWifi && (
                                        <Badge variant="outline" className="gap-1">
                                            <Wifi className="h-3 w-3" />
                                            WiFi
                                        </Badge>
                                    )}
                                </div>

                                {room.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                        {room.description}
                                    </p>
                                )}

                                <div className="flex gap-2 pt-4 border-t mt-4">
                                    <Link href={`/admin/rooms/${room.id}/edit`} className="flex-1">
                                        <Button variant="outline" className="w-full gap-2">
                                            <Edit className="h-4 w-4" />
                                            تعديل
                                        </Button>
                                    </Link>
                                    <DeleteRoomButton roomId={room.id} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {rooms?.length === 0 && (
                    <div className="col-span-full text-center py-12 bg-muted/50 rounded-lg border-2 border-dashed">
                        <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold">لا توجد قاعات</h3>
                        <p className="text-muted-foreground mb-4">لم يتم إضافة أي قاعات اجتماعات بعد</p>
                        <Link href="/admin/rooms/new">
                            <Button variant="outline">إضافة أول قاعة</Button>
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
