import SendIcon from '@/app/components/icons/SendIcon';
import { createStyles } from 'antd-style';
import React, { useEffect, useState } from 'react';

const useStyles = createStyles((utils) => {
  const css = utils.css;
  return {
    container: css`
      display: flex;
      flex-direction: column;
      width: 100%;
      gap: 0.75rem;
      border-radius: 22px;
      transition: all;
      position: relative;
      background-color: var(--fill-input-chat);
      padding-top: 0.75rem;
      padding-bottom: 0.75rem;
      max-height: 300px;
      box-shadow: 0px 12px 32px 0px rgba(0, 0, 0, 0.02);
      border: 1px solid rgba(0, 0, 0, 0.08);

      &.selected {
        border-color: rgba(0, 0, 0, 0.2);
      }

      &.dark & {
        border-color: var(--border-main);
      }
    `,
    scrollArea: css`
      overflow-y: auto;
      padding-left: 1rem;
      padding-right: 0.5rem;
    `,
    textarea: css`
      width: 100%;
      resize: none;
      min-height: 40px;
      height: 46px;
      font-size: 15px;
      border: none;
      outline: none;
      background: var(--fill-input-chat);
      padding: 0;
      margin: 0;
      overflow: hidden;
      color: inherit;
      font-family: inherit;
      font-weight: normal;
      line-height: 1.5;
      box-shadow: none;
    `,
    footer: css`
      display: flex;
      justify-content: space-between;
      width: 100%;
      padding-left: 0.75rem;
      padding-right: 0.75rem;
    `,
    actionsLeft: css`
      display: flex;
      gap: 0.5rem;
      align-items: center;
    `,
    actionsRight: css`
      display: flex;
      gap: 0.5rem;
    `,
    sendButton: css`
      width: 2rem;
      height: 2rem;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s, opacity 0.2s;
      background-color: var(--Button-primary-black);
      color: white;
      cursor: pointer;
      outline: none;
      border: none;

      &:hover {
        opacity: 0.9;
      }
    `,
    sendButtonDisabled: css`
      width: 2rem;
      height: 2rem;
      border-radius: 9999px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s, opacity 0.2s;
      color: white;
      outline: none;
      border: none;
      background-color: var(--fill-tsp-white-dark);
      cursor: not-allowed;

      &:hover {
        opacity: 0.9;
      }
    `
  };
});

interface ChatInputProps {
  modelValue: string;
  rows?: number;
  onSubmit?: () => void;
  onUpdateModelValue: (value: string) => void;
  disabled?: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({
  modelValue,
  rows = 1,
  onSubmit,
  onUpdateModelValue,
  disabled = false
}) => {
  const [isComposing, setIsComposing] = useState(false);
  const [isSendDisabled, setIsSendDisabled] = useState(true);
  const [ chatboxSelected, setChatboxSelected ] = useState(false);

  const { styles } = useStyles();

  // Update disabled state based on input value
  useEffect(() => {
    setIsSendDisabled(modelValue.trim() === '');
  }, [modelValue]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdateModelValue(e.target.value);
  };

  const handleSubmit = () => {
    if ((isSendDisabled || disabled) || !onSubmit) return;
    onSubmit();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (isComposing) return;

    if (e.key === 'Enter' && !e.shiftKey && !(isSendDisabled || disabled)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div
      className={`${styles.container} ${chatboxSelected ? 'selected' : ''}`}
      onClick={() => setChatboxSelected(true)}
      onBlur={() => setChatboxSelected(false)}
    >
      <div className={styles.scrollArea}>
        <textarea
          rows={rows}
          value={modelValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onCompositionStart={() => setIsComposing(true)}
          onCompositionEnd={() => setIsComposing(false)}
          placeholder="给 Manus 一个任务..."
          className={styles.textarea}
        />
      </div>
      <footer className={styles.footer}>
        <div className={styles.actionsLeft}></div>
        <div className={styles.actionsRight}>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSendDisabled || disabled}
            className={(isSendDisabled || disabled) ? styles.sendButtonDisabled : styles.sendButton}
          >
            <SendIcon disabled={isSendDisabled || disabled} />
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ChatInput;
