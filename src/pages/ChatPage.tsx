import React, {useState, useRef, useEffect, useCallback} from 'react';
import ChatBox from '@/components/ChatBox';
import ChatMessage from '@/components/ChatMessage';
import SimpleBar, {type ScrollableContentRef} from '@/components/SimpleBar';
import ToolPanel, {type ToolPanelRef} from '@/components/ToolPanel';
import {chatWithAgent} from '@/services/api/sandbox';
import type {Message, MessageContent, ToolContent, StepContent} from '@/types/message';
// @ts-ignore
import {ArrowDown, Bot, Clock, ChevronUp, ChevronDown, PanelLeft} from 'lucide-react';
// import { history } from '@umijs/max';
import {useNavigate, useLocation} from "react-router";
// import { useParams } from 'umi';
import StepSuccessIcon from '@/components/icons/StepSuccessIcon';
import type {MessageEventData, StepEventData, ToolEventData, PlanEventData} from '@/types/sseEvent';
// import '@/assets/global.css';
// import '@/assets/theme.css';
import {useStyles} from '@/assets/chatPageStyle';
import Panel from '@/components/Panel';
import {Button} from 'antd';

const ChatComponent: React.FC = () => {

  const {styles} = useStyles();

  const navigate = useNavigate();

  // 状态管理
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [title, setTitle] = useState<string>('New Chat');
  const [isShowPlanPanel, setIsShowPlanPanel] = useState<boolean>(false);
  const [plan, setPlan] = useState<PlanEventData | undefined>(undefined);
  const [realTime, setRealTime] = useState<boolean>(true);
  const [follow, setFollow] = useState<boolean>(true);
  const [lastNoMessageTool, setLastNoMessageTool] = useState<ToolContent | undefined>(undefined);
  const [agentId, setAgentId] = useState<string>('');

  const panelWidth = 300;
  const [panelOpen, setPanelOpen] = useState<boolean>(false);
  const [panelFixed, setPanelFixed] = useState<boolean>(false);

  // Refs
  const simpleBarRef = useRef<ScrollableContentRef>(null);
  const toolPanelRef = useRef<ToolPanelRef>(null);
  // const navigate = useNavigate();
  const {search} = useLocation();
  const params = new URLSearchParams(search);

  // 获取最后一步
  const getLastStep = useCallback((): StepContent | undefined => {
    return messages.filter(message => message.type === 'step').pop()?.content as StepContent;
  }, [messages]);

  // 处理滚动事件
  const handleScroll = useCallback(() => {
    const isBottom = simpleBarRef.current?.isScrolledToBottom(10) ?? false;
    setFollow(isBottom);
  }, []);

  // 自动滚动到底部
  useEffect(() => {
    if (follow && simpleBarRef.current) {
      simpleBarRef.current.scrollToBottom();
    }
  }, [messages, follow]);


  // 处理消息事件
  const handleMessageEvent = (messageData: MessageEventData) => {
    setMessages(prev => [
      ...prev,
      {
        type: 'assistant',
        content: messageData,
      },
    ]);
  };

  // 处理工具事件
  const handleToolEvent = (toolData: ToolEventData) => {
    const lastStep = getLastStep();

    if (lastStep?.status === 'running') {
      // 添加到步骤工具列表
      const updatedMessages = messages.map(msg => {
        if (msg.type === 'step' && (msg.content as StepContent).id === lastStep.id) {
          return {
            ...msg,
            content: {
              ...msg.content,
              tools: [...((msg.content as StepContent).tools || []), toolData],
            },
          };
        }
        return msg;
      });
      setMessages(updatedMessages);
    } else {
      // 新增工具消息
      setMessages(prev => [
        ...prev,
        {
          type: 'tool',
          content: toolData,
        },
      ]);
    }

    // 处理非消息工具
    if (toolData.name !== 'message') {
      setLastNoMessageTool(toolData);
      if (realTime) {
        toolPanelRef.current?.show(toolData);
      }
    }
  };

  // 处理步骤事件
  const handleStepEvent = (stepData: StepEventData) => {
    // const lastStep = getLastStep();
    if (stepData.status === 'running') {
      const messagesCopy = [...messages];
      messagesCopy.push({
        type: 'step',
        content: {
          ...stepData,
          tools: [],
        } as StepContent,
      });
      setMessages(messagesCopy);
    } else if (stepData.status === 'completed') {
      // 找到最后一个 type 为 'step' 的消息，修改其 status 字段
      const lastStepIndex = [...messages]
        .map((msg, idx) => ({msg, idx}))
        .filter(({msg}) => msg.type === 'step')
        .pop()?.idx;

      if (lastStepIndex !== undefined) {
        const messagesCopy = [...messages];
        const stepMsg = messagesCopy[lastStepIndex];
        messagesCopy[lastStepIndex] = {
          ...stepMsg,
          content: {
            ...stepMsg.content,
            status: stepData.status,
          } as StepContent,
        };
        setMessages(messagesCopy);
      }
    } else if (stepData.status === 'failed') {
      setIsLoading(false);
    }
  };

  // 处理错误事件
  const handleErrorEvent = (errorData: any) => {
    setIsLoading(false);
    setMessages(prev => [
      ...prev,
      {
        type: 'assistant',
        content: {
          content: errorData.error,
          timestamp: errorData.timestamp,
        },
      },
    ]);
  };

  // 事件处理
  const handleEvent = (event: any) => {
    if (event.event === 'message') {
      handleMessageEvent(event.data);
    } else if (event.event === 'tool') {
      handleToolEvent(event.data);
    } else if (event.event === 'step') {
      handleStepEvent(event.data);
    } else if (event.event === 'done') {
      setIsLoading(false);
    } else if (event.event === 'error') {
      handleErrorEvent(event.data);
    } else if (event.event === 'title') {
      setTitle(event.data.title);
    } else if (event.event === 'plan') {
      setPlan(event.data);
    }
  };

  // 发送消息
  const sendMessage = async (message: string = '') => {
    if (!agentId) return;

    if (message.trim()) {
      setMessages(prev => [
        ...prev,
        {
          type: 'user',
          content: {
            content: message,
            timestamp: Math.floor(Date.now() / 1000),
          },
        },
      ]);
    }

    setFollow(true);
    setInputMessage('');
    setIsLoading(true);

    try {
      await chatWithAgent(
        agentId,
        message,
        handleEvent,
        (error: any) => {
          console.error('Chat error:', error);
          setIsLoading(false);
        },
      );
    } catch (error) {
      console.error('Chat error:', error);
      setIsLoading(false);
    }
  };

  // 初始化聊天
  useEffect(() => {
    const agentId = params.get('agentId');
    if (agentId) {
      setAgentId(String(agentId));
      const message = window.history.state?.message;

      if (message) {
        sendMessage(message);
      } else {
        sendMessage();
      }
    }
  }, []);


  // 计划相关计算
  const runningStep = (): string => {
    for (const step of plan?.steps ?? []) {
      if (step.status === 'running') {
        return step.description;
      }
    }
    return 'Confirm Task Completion';
  };

  const planCompleted = (): boolean => {
    return plan?.steps.every(step => step.status === 'completed') ?? false;
  };

  const planProgress = (): string => {
    const completedSteps = plan?.steps.filter(step => step.status === 'completed').length ?? 0;
    return `${completedSteps} / ${plan?.steps.length ?? 1}`;
  };

  // 其他处理函数
  const handleToolClick = (tool: ToolContent) => {
    setRealTime(false);
    if (toolPanelRef.current && agentId) {
      toolPanelRef.current.show(tool);
    }
  };

  const jumpToRealTime = () => {
    setRealTime(true);
    if (lastNoMessageTool) {
      toolPanelRef.current?.show(lastNoMessageTool);
    }
  };

  const handleFollow = () => {
    setFollow(true);
    simpleBarRef.current?.scrollToBottom();
  };

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <>
      <Panel panelWidth={panelWidth} isOpen={panelOpen} setIsOpen={setPanelOpen} fixed={panelFixed} setFixed={setPanelFixed}/>
      <SimpleBar ref={simpleBarRef} onScroll={handleScroll}>
        <div style={{
          height: '100%',
          backgroundImage: 'linear-gradient(180deg, #F3F3F3 0%, #EDEDED 100%)',
          overflowX: 'hidden' as const,
        }}>
          <div
            style={{
              flex: '1 1 0%',
              minWidth: 0,
              height: '100%',
              paddingTop: 0,
              paddingBottom: 0,
              paddingRight: 0,
              position: 'relative'
            }}
          >
            <div
              style={{
                display: 'flex',
                height: '100%',
                backgroundColor: 'var(--background-gray-main)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flex: '1 1 0px',
                  minWidth: 0,
                  minHeight: 0
                }}
              >
                <div className={styles.container}>
                  {/* 顶部标题栏 */}
                  <div className={styles.header}>
                    <div className={styles.inlineFlexContainer}>
                      <Button type="text" onClick={() => setPanelOpen(!panelOpen)}
                              icon={<PanelLeft/>}/>
                      <div className={styles.logoContainer}>
                        <div onClick={handleGoHome} className={styles.logoIconContainer}>
                          <Bot className={styles.botIcon} size={24}/>
                        </div>
                        <div className={styles.logoSeparator}>
                          <span className={styles.logoTitle}>{title}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 消息列表 */}
                  <div className={styles.messageList}>
                    {messages.map((message, index) => (
                      <ChatMessage key={index} message={message} onToolClick={handleToolClick}/>
                    ))}

                    {/* 加载指示器 loading indicator */}
                    {isLoading && (
                      <div className={styles.loadingIndicatorContainer}>
                        <span>Thinking</span>
                        <span className={styles.animateBounceDotContainer}>
                        <span className={styles.loadingDot} style={{animationDelay: '0ms'}}/>
                        <span className={styles.loadingDot} style={{animationDelay: '200ms'}}/>
                        <span className={styles.loadingDot} style={{animationDelay: '400ms'}}/>
                      </span>
                      </div>
                    )}
                  </div>

                  {/* 底部输入区域 */}
                  <div className={styles.inputArea}>
                    {plan && plan.steps.length > 0 && (
                      <>
                        {/* 跟随按钮 */}
                        {!follow && (
                          <button type="button" onClick={handleFollow}
                                  className={styles.followButton}>
                            <ArrowDown className={styles.arrowDown} size={20}/>
                          </button>
                        )}

                        {/* 计划面板 */}
                        {isShowPlanPanel ? (
                          <div className={styles.planPanel}>
                            <div className={styles.planPanelContainer1}>
                              <div className={styles.planPanelContainer2}>
                                <div className={styles.planPanelContainer3}>
                                  <div className={styles.planPanelContainer4}>
                                    <div
                                      onClick={() => setIsShowPlanPanel(false)}
                                      className={styles.showPanelButton}
                                    >
                                      <ChevronDown className={styles.chevronDown}
                                                   size={16}/>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div style={{paddingLeft: 16, paddingRight: 16}}>
                                <div className={styles.taskProgressContainer1}>
                                  <div className={styles.taskProgressFlexBox}>
                                    <span className={styles.taskProgressText}>Task Progress</span>
                                    <div className={styles.taskProgressContainer2}>
                                      <span className={styles.taskProgressContainer3}>{planProgress()}</span>
                                    </div>
                                  </div>

                                  <div className={styles.taskProgressScrollBox}>
                                    {plan.steps.map((step) => (
                                      <div key={step.id}
                                           className={styles.stepIconBox}>
                                        {step.status === 'completed' ? (
                                          <StepSuccessIcon/>
                                        ) : (
                                          <Clock className={styles.clock}
                                                 size={16}/>
                                        )}

                                        <div
                                          className={styles.stepDescriptionContainer}>
                                          <div
                                            className={styles.stepDescription}
                                            title={step.description}>
                                            {step.description}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div onClick={() => setIsShowPlanPanel(true)}
                               className={styles.anotherPlanPanel}>
                            <div className={styles.anotherPlanPanelBox1}>
                              <div className={styles.anotherPlanPanelBox2}>
                                <div className={styles.anotherPlanPanelBox3}>
                                  <div className={styles.anotherPlanPanelBox4}>
                                    {planCompleted() ? (
                                      <StepSuccessIcon/>
                                    ) : (
                                      <Clock className={styles.clock} size={16}/>
                                    )}

                                    <div className={styles.runningStepContainer}>
                                      <div className={styles.runningStepText}
                                           title={runningStep()}>
                                        {runningStep()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <button type="button" className={styles.runningStepButton}>
                                                            <span
                                                              className={styles.runningStepProgress}>{planProgress()}</span>
                              <ChevronUp style={{color: 'var(--icon-tertiary)'}}
                                         size={16}/>
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {/* 聊天输入框 */}
                  <ChatBox
                    modelValue={inputMessage}
                    onUpdateModelValue={(value) => setInputMessage(value)}
                    rows={1}
                    onSubmit={() => sendMessage(inputMessage)}
                  />
                </div>

                <ToolPanel
                  ref={toolPanelRef}
                  agentId={agentId}
                  realTime={realTime}
                  onJumpToRealTime={jumpToRealTime}
                />
              </div>
            </div>
          </div>
        </div>
      </SimpleBar>
    </>
  );
};

export default ChatComponent;
