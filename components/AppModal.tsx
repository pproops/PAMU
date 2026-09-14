import { Ionicons } from '@expo/vector-icons';
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

type ModalType =
  | 'success'
  | 'delete'
  | 'error'
  | 'info';

type AppModalProps = {
  visible: boolean;
  type?: ModalType;
  title: string;
  message: string;

  confirmText?: string;
  cancelText?: string;

  onConfirm: () => void;
  onCancel?: () => void;
};

export default function AppModal({
  visible,
  type = 'info',
  title,
  message,
  confirmText = 'U redu',
  cancelText = 'Odustani',
  onConfirm,
  onCancel,
}: AppModalProps) {
  const getIcon = (): keyof typeof Ionicons.glyphMap => {
    switch (type) {
      case 'success':
        return 'checkmark';

      case 'delete':
        return 'trash-outline';

      case 'error':
        return 'close';

      default:
        return 'information-outline';
    }
  };

  const getAccentColor = () => {
    switch (type) {
      case 'success':
        return '#0bdc73';

      case 'delete':
        return '#ff6b6b';

      case 'error':
        return '#ff6b6b';

      default:
        return '#55c8ff';
    }
  };

  const accentColor =
    getAccentColor();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => {
        if (onCancel) {
          onCancel();
        }
      }}
    >
      <View
        style={
          styles.overlay
        }
      >
        <Pressable
          style={
            StyleSheet.absoluteFill
          }
          onPress={() => {
            if (onCancel) {
              onCancel();
            }
          }}
        />

        <View
          style={
            styles.modalCard
          }
        >
          <View
            style={[
              styles.iconCircle,
              {
                backgroundColor:
                  type === 'success'
                    ? '#14342d'
                    : type ===
                        'delete' ||
                      type ===
                        'error'
                    ? '#351f25'
                    : '#102b39',
              },
            ]}
          >
            <Ionicons
              name={getIcon()}
              size={31}
              color={
                accentColor
              }
            />
          </View>

          <Text
            style={
              styles.title
            }
          >
            {title}
          </Text>

          <Text
            style={
              styles.message
            }
          >
            {message}
          </Text>

          <View
            style={
              styles.buttonsContainer
            }
          >
            {onCancel && (
              <TouchableOpacity
                activeOpacity={
                  0.85
                }
                style={
                  styles.cancelButton
                }
                onPress={
                  onCancel
                }
              >
                <Text
                  style={
                    styles.cancelButtonText
                  }
                >
                  {cancelText}
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={
                0.85
              }
              style={[
                styles.confirmButton,
                {
                  backgroundColor:
                    accentColor,
                },
              ]}
              onPress={
                onConfirm
              }
            >
              <Text
                style={
                  styles.confirmButtonText
                }
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles =
  StyleSheet.create({
    overlay: {
      flex: 1,

      backgroundColor:
        'rgba(0, 0, 0, 0.72)',

      justifyContent:
        'center',

      alignItems:
        'center',

      paddingHorizontal: 25,
    },

    modalCard: {
      width: '100%',
      maxWidth: 390,

      backgroundColor:
        '#10232e',

      borderWidth: 1,
      borderColor:
        '#1c3542',

      borderRadius: 22,

      paddingHorizontal: 22,
      paddingTop: 26,
      paddingBottom: 20,

      alignItems:
        'center',

      elevation: 12,

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 6,
      },

      shadowOpacity: 0.35,
      shadowRadius: 12,
    },

    iconCircle: {
      width: 64,
      height: 64,

      borderRadius: 20,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginBottom: 17,
    },

    title: {
      color: '#ffffff',

      fontSize: 20,

      fontWeight: '900',

      textAlign:
        'center',

      marginBottom: 9,
    },

    message: {
      color: '#8fa0aa',

      fontSize: 13,

      lineHeight: 20,

      textAlign:
        'center',

      marginBottom: 23,

      paddingHorizontal: 5,
    },

    buttonsContainer: {
      width: '100%',

      flexDirection:
        'row',

      gap: 10,
    },

    cancelButton: {
      flex: 1,

      minHeight: 49,

      backgroundColor:
        '#0d202a',

      borderWidth: 1,
      borderColor:
        '#1c3542',

      borderRadius: 13,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 12,
    },

    cancelButtonText: {
      color: '#c4ced4',

      fontSize: 14,

      fontWeight: '700',
    },

    confirmButton: {
      flex: 1,

      minHeight: 49,

      borderRadius: 13,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal: 12,
    },

    confirmButtonText: {
      color: '#07151d',

      fontSize: 14,

      fontWeight: '900',
    },
  });