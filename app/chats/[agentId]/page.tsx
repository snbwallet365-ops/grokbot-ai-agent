import ChatApp from "@/components/ChatApp";
export default function AgentChatPage({ params }: { params: { agentId: string } }) { return <ChatApp activeId={params.agentId} />; }
