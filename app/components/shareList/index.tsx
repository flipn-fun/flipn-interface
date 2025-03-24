import Modal from "../modal";
import styles from "./index.module.css";
import Content from "./content";    
import { useUserAgent } from "@/app/context/user-agent";
import { Popup } from "antd-mobile";
import { Project } from "@/app/type";
interface ShareListProps {
    token: Project | undefined;
    show: boolean;
    onClose: () => void;
}

const ShareList: React.FC<ShareListProps> = ({ token, show, onClose }) => {
    const { isMobile } = useUserAgent();

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
                <Content data={token} />
            </Popup>
        )
    }

    return (
        <Modal
            open={show}
            onClose={onClose}
        >
            <Content data={token} />
        </Modal>
    );
};

export default ShareList;
