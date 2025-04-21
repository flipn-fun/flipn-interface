import Modal from "../modal";
import styles from "./index.module.css";
import Content from "./content";
import { useUserAgent } from "@/app/context/user-agent";
import { Popup } from "antd-mobile";
import { Project } from "@/app/type";
import useXShare from "@/app/hooks/use-x-share";
interface ShareListProps {
    token: Project | undefined;
    show: boolean;
    onClose: () => void;
    openX: (show: boolean) => void;
    openSelf: (token: Project) => void;
}

const ShareList: React.FC<ShareListProps> = ({ token, show, openX, onClose, openSelf }) => {
    const { isMobile } = useUserAgent();

    const { shareToTwitter, code, xUserInfo, clear, getAuthUrl, bindTwitter } = useXShare({
        openSelf,
        token
    });

    if (isMobile) {
        return (
            <Popup
                visible={show}
                onMaskClick={onClose}
                onClose={onClose}
                className="no-bg"
                bodyStyle={{
                    borderTopLeftRadius: "12px",
                    borderTopRightRadius: "12px",
                    paddingTop: 10,
                    paddingBottom: 10,
                    background: '#252328'
                }}
            >
                <Content clear={() => {
                    onClose();
                    clear();
                }} data={token} bindTwitter={bindTwitter as any} xUserInfo={xUserInfo} getAuthUrl={getAuthUrl as any} code={code} shareToTwitter={shareToTwitter} openX={openX} openSelf={openSelf} />
            </Popup>
        )
    }

    return (
        <Modal
            open={show}
            onClose={onClose}
        >
            <Content clear={() => {
                onClose();
                clear();
            }} data={token} bindTwitter={bindTwitter as any} xUserInfo={xUserInfo} getAuthUrl={getAuthUrl as any} code={code} shareToTwitter={shareToTwitter} openX={openX} openSelf={openSelf} />
        </Modal>
    );
};

export default ShareList;
