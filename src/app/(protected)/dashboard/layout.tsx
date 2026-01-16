

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // We can still fetch it here if needed for other things, but Chat is moved to Root->Shell
    // Actually, if we remove Chat from here, we don't strictly need adminUser here unless other child components need it?
    // The original code passed adminUser to FloatingChat.
    // If we remove FloatingChat, we can just return children.

    // However, to be safe and cleaner, if we don't need adminUser for anything else in this layout, we can simplify.
    // Let's keep it simple.

    return (
        <>
            {children}
        </>
    );
}

