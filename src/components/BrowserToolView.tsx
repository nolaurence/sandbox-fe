import React, { useRef } from 'react';
import type {ToolContent} from '@/types/message';
import { getVNCUrl } from '@/services/api/sandbox';
import { createStyles } from 'antd-style';

interface BrowserToolViewProps {
  agentId: string;
  toolContent: ToolContent
}

// @ts-ignore
const useStyles = createStyles((utils) => {
  const css = utils.css;
  return {
   header: css`
     height: 36px;
     display: flex;
     align-items: center;
     padding: 0 12px;
     width: 100%;
     background: var(--background-gray-main);
     border-bottom: 1px solid var(--border-main);
     border-top-left-radius: 12px;
     border-top-right-radius: 12px;
     box-shadow: inset 0 1px 0 0 #FFFFFF;
   `,
   headerDark: css`
     flex: 1;
     display: flex;
     align-items: center;
     justify-content: center;
   `,
   headerContent: css`
     flex: 1;
     display: flex;
     align-items: center;
     justify-content: center;
   `,
   title: css`
     max-width: 250px;
     overflow: hidden;
     text-overflow: ellipsis;
     white-space: nowrap;
     color: var(--text-tertiary);
     font-size: 14px;
     font-weight: 500;
     text-align: center;
   `,
   main: css`
     flex: 1px;
     min-height: 0;
     width: 100%;
     overflow-y: auto;
   `,
   container: css`
     padding: 0;
     display: flex;
     flex-direction: column;
     position: relative;
     height: 100%;
   `,
   vncWrapper: css`
     width: 100%;
     height: 100%;
     object-fit: cover;
     display: flex;
     align-items: center;
     justify-content: center;
     background: var(--fill-white);
     position: relative;
   `,
   vncInner: css`
     width: 100%;
     height: 100%;
   `,
   vncContainer: css`
     display: flex;
     width: 100%;
     height: 100%;
     overflow: auto;
     background: rgb(40, 40, 40);
   `,
  };
})

const BrowserToolView: React.FC<BrowserToolViewProps> = ({ agentId, toolContent }) => {
  const { styles } = useStyles();
  const vncContainer = useRef(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.title}>
            {toolContent?.args?.url || 'Browser'}
          </div>
        </div>
      </div>
      <div className={styles.main}>
        <div className={styles.container}>
          <div className={styles.vncWrapper}>
            <div className={styles.vncInner}>
              <div ref={vncContainer} className={styles.vncContainer}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrowserToolView;
