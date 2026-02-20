import React, { useEffect, useRef, useState } from 'react';
import { initializeBlock, useBase, useCursor, useLoadable, useWatchable, useRecords, useRecordById, useGlobalConfig } from '@airtable/blocks/ui';

function AddressSearchApp() {
    const base = useBase();
    const globalConfig = useGlobalConfig();

    // 설정에서 테이블명 불러오기 (기본값: "전 사업부 고객 리스트")
    const savedTableName = globalConfig.get('tableName') || '전 사업부 고객 리스트';

    const roadAddressFieldName = "도로명 주소";
    const jibunAddressFieldName = "지번 주소";
    const zipFieldName = "우편번호";
    const buildingFieldName = "건물명";

    const [showSettings, setShowSettings] = useState(false);
    const [tableNameInput, setTableNameInput] = useState(savedTableName);

    const table = base.getTableByNameIfExists(savedTableName);
    const cursor = useCursor();

    useLoadable(cursor);
    useWatchable(cursor, ['selectedRecordIds', 'activeTableId']);

    const selectedRecordId = cursor.selectedRecordIds.length > 0
        ? cursor.selectedRecordIds[0]
        : null;

    const records = useRecords(table);
    const selectedRecord = useRecordById(table, selectedRecordId || '');
    const rowNumber = records && selectedRecordId
        ? records.findIndex(r => r.id === selectedRecordId) + 1
        : null;

    const [isScriptLoaded, setIsScriptLoaded] = useState(false);
    const [toast, setToast] = useState(null);
    const [isHovered, setIsHovered] = useState(false);
    const [showEmbed, setShowEmbed] = useState(false);

    const embedRef = useRef(null);
    const targetRecordIdRef = useRef(null);

    useEffect(() => {
        const script = document.createElement("script");
        script.src = "//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        script.async = true;
        script.onload = () => setIsScriptLoaded(true);
        document.body.appendChild(script);
        return () => { document.body.removeChild(script); };
    }, []);

    useEffect(() => {
        if (!showEmbed || !isScriptLoaded || !embedRef.current) return;
        embedRef.current.innerHTML = '';

        new window.daum.Postcode({
            oncomplete: async function (data) {
                setShowEmbed(false);
                try {
                    const zipField = table.getFieldByNameIfExists(zipFieldName);
                    const zipValue = zipField.type === 'number' ? Number(data.zonecode) : data.zonecode;
                    const updateFields = {
                        [roadAddressFieldName]: data.roadAddress,
                        [jibunAddressFieldName]: data.jibunAddress || data.autoJibunAddress || '',
                        [zipFieldName]: zipValue
                    };
                    const buildingField = table.getFieldByNameIfExists(buildingFieldName);
                    if (buildingField && data.buildingName) {
                        updateFields[buildingFieldName] = data.buildingName;
                    }
                    await table.updateRecordAsync(targetRecordIdRef.current, updateFields);
                    showToast('success', '✅ 주소가 성공적으로 업데이트되었습니다!');
                } catch (error) {
                    console.error("Update failed:", error);
                    showToast('error', `❌ 업데이트 실패: ${error.message}`);
                }
            },
            onclose: function () {
                setShowEmbed(false);
            },
            width: '100%',
            height: 400,
        }).embed(embedRef.current);
    }, [showEmbed, isScriptLoaded]);

    const showToast = (type, message) => {
        setToast({ type, message });
        setTimeout(() => setToast(null), 2500);
    };

    const handleAddressSearch = () => {
        if (!selectedRecordId) return;
        targetRecordIdRef.current = selectedRecordId;
        setShowEmbed(true);
    };

    const handleSaveSettings = async () => {
        const trimmed = tableNameInput.trim();
        if (!trimmed) return;
        await globalConfig.setAsync('tableName', trimmed);
        setShowSettings(false);
        showToast('success', '✅ 설정이 저장되었습니다!');
    };

    // ── 스타일 ────────────────────────────────────────
    const styles = {
        root: {
            minHeight: '100vh',
            background: 'linear-gradient(160deg, #f0f4ff 0%, #ffffff 100%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            padding: '28px 20px',
            fontFamily: "'Segoe UI', Arial, sans-serif",
            boxSizing: 'border-box',
        },
        headerRow: {
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            marginBottom: 24,
        },
        header: {
            textAlign: 'center',
        },
        icon: { fontSize: 36, marginBottom: 6 },
        title: {
            margin: 0,
            fontSize: 20,
            fontWeight: 700,
            color: '#1a1a2e',
            letterSpacing: '-0.5px',
        },
        subtitle: { margin: '4px 0 0', fontSize: 12, color: '#6b7280' },
        settingsBtn: {
            position: 'absolute',
            right: 0,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'transparent',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            padding: '6px 10px',
            cursor: 'pointer',
            fontSize: 16,
            color: '#6b7280',
            lineHeight: 1,
        },
        settingsPanel: {
            width: '100%',
            background: '#fff',
            borderRadius: 14,
            padding: '20px 18px',
            marginBottom: 16,
            boxShadow: '0 0 0 2px #3b82f6, 0 4px 16px rgba(59,130,246,0.12)',
            boxSizing: 'border-box',
        },
        settingsTitle: {
            fontSize: 13,
            fontWeight: 700,
            color: '#1a1a2e',
            marginBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 6,
        },
        label: {
            fontSize: 11,
            fontWeight: 600,
            color: '#6b7280',
            marginBottom: 6,
            display: 'block',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
        },
        input: {
            width: '100%',
            padding: '10px 12px',
            border: '1px solid #d1d5db',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            color: '#1a1a2e',
            boxSizing: 'border-box',
            outline: 'none',
            marginBottom: 12,
        },
        fieldGuide: {
            background: '#f8faff',
            border: '1px solid #dbeafe',
            borderRadius: 10,
            padding: '12px 14px',
            marginTop: 4,
            marginBottom: 12,
        },
        fieldGuideTitle: {
            fontSize: 11,
            fontWeight: 700,
            color: '#2563eb',
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
        },
        fieldGuideRow: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 0',
            borderBottom: '1px solid #e0eaff',
        },
        fieldGuideRowLast: {
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '4px 0',
        },
        fieldName: {
            fontSize: 12,
            fontWeight: 600,
            color: '#1d4ed8',
            minWidth: 90,
        },
        fieldType: {
            fontSize: 11,
            color: '#6b7280',
            background: '#eff6ff',
            borderRadius: 4,
            padding: '1px 6px',
        },
        settingsActions: {
            display: 'flex',
            gap: 8,
        },
        saveBtn: {
            flex: 1,
            padding: '10px',
            background: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
        },
        cancelBtn2: {
            flex: 1,
            padding: '10px',
            background: 'transparent',
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
        },
        card: (isSelected) => ({
            width: '100%',
            borderRadius: 14,
            padding: '16px 18px',
            marginBottom: 16,
            background: '#fff',
            boxShadow: isSelected
                ? '0 0 0 2px #3b82f6, 0 4px 16px rgba(59,130,246,0.12)'
                : '0 1px 4px rgba(0,0,0,0.08)',
            transition: 'all 0.25s ease',
            boxSizing: 'border-box',
        }),
        cardLabel: {
            fontSize: 11,
            fontWeight: 600,
            color: '#9ca3af',
            textTransform: 'uppercase',
            letterSpacing: '0.6px',
            marginBottom: 6,
        },
        cardValue: (isSelected) => ({
            fontSize: 14,
            fontWeight: 600,
            color: isSelected ? '#1d4ed8' : '#9ca3af',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
        }),
        tableChip: {
            display: 'inline-block',
            background: '#eff6ff',
            color: '#2563eb',
            borderRadius: 6,
            padding: '2px 8px',
            fontSize: 12,
            fontWeight: 600,
        },
        button: (isActive, isHov) => ({
            width: '100%',
            padding: '15px',
            background: isActive
                ? (isHov ? '#f0cc00' : '#FEE500')
                : '#e5e7eb',
            color: isActive ? '#1a1a1a' : '#9ca3af',
            border: 'none',
            borderRadius: 12,
            fontWeight: 700,
            fontSize: 15,
            cursor: isActive ? 'pointer' : 'not-allowed',
            transition: 'all 0.2s ease',
            transform: isActive && isHov ? 'translateY(-1px)' : 'none',
            boxShadow: isActive && isHov
                ? '0 6px 18px rgba(254,229,0,0.5)'
                : isActive ? '0 3px 8px rgba(254,229,0,0.3)' : 'none',
            letterSpacing: '-0.3px',
        }),
        cancelButton: {
            width: '100%',
            padding: '10px',
            marginTop: 8,
            background: 'transparent',
            color: '#6b7280',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
        },
        embedWrapper: {
            width: '100%',
            borderRadius: 14,
            overflow: 'hidden',
            border: '2px solid #3b82f6',
            marginBottom: 12,
        },
        toast: (type) => ({
            width: '100%',
            padding: '12px 16px',
            borderRadius: 10,
            marginTop: 12,
            background: type === 'success' ? '#f0fdf4' : '#fef2f2',
            color: type === 'success' ? '#15803d' : '#dc2626',
            border: `1px solid ${type === 'success' ? '#bbf7d0' : '#fecaca'}`,
            fontSize: 13,
            fontWeight: 600,
            textAlign: 'center',
            boxSizing: 'border-box',
        }),
        hint: {
            marginTop: 20,
            textAlign: 'center',
            color: '#9ca3af',
            fontSize: 11,
            lineHeight: 1.7,
        },
    };

    const requiredFields = [
        { name: '건물명', type: 'Single line text' },
        { name: '도로명 주소', type: 'Single line text' },
        { name: '지번 주소', type: 'Single line text' },
        { name: '우편번호', type: 'Single line text' },
    ];

    // 설정 패널
    const SettingsPanel = () => (
        <div style={styles.settingsPanel}>
            <div style={styles.settingsTitle}>
                <span>⚙️</span> 설정
            </div>

            <label style={styles.label}>테이블 이름</label>
            <input
                style={styles.input}
                value={tableNameInput}
                onChange={e => setTableNameInput(e.target.value)}
                placeholder="테이블 이름 입력"
            />

            {/* 필드 요구사항 안내 */}
            <div style={styles.fieldGuide}>
                <div style={styles.fieldGuideTitle}>
                    <span>📋</span> 필수 필드 안내
                </div>
                <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 8 }}>
                    테이블에 아래 필드가 <strong>Single line text</strong> 타입으로 있어야 합니다.
                </div>
                {requiredFields.map((f, i) => (
                    <div
                        key={f.name}
                        style={i < requiredFields.length - 1 ? styles.fieldGuideRow : styles.fieldGuideRowLast}
                    >
                        <span style={styles.fieldName}>{f.name}</span>
                        <span style={styles.fieldType}>{f.type}</span>
                    </div>
                ))}
            </div>

            <div style={styles.settingsActions}>
                <button style={styles.saveBtn} onClick={handleSaveSettings}>저장</button>
                <button style={styles.cancelBtn2} onClick={() => {
                    setTableNameInput(savedTableName);
                    setShowSettings(false);
                }}>취소</button>
            </div>
        </div>
    );

    if (!table) {
        return (
            <div style={{ ...styles.root, justifyContent: 'center' }}>
                <div style={styles.headerRow}>
                    <div style={styles.header}>
                        <div style={styles.icon}>📍</div>
                        <h2 style={styles.title}>카카오 주소 검색</h2>
                    </div>
                    <button style={styles.settingsBtn} onClick={() => setShowSettings(!showSettings)}>⚙️</button>
                </div>
                {showSettings && <SettingsPanel />}
                {!showSettings && (
                    <>
                        <div style={{ fontSize: 40 }}>⚠️</div>
                        <p style={{ fontWeight: 700, color: '#374151' }}>테이블을 찾을 수 없습니다</p>
                        <p style={{ color: '#6b7280', fontSize: 13 }}>
                            ⚙️ 설정 버튼을 눌러 테이블 이름을 확인해주세요.<br />
                            현재 설정값: <strong>"{savedTableName}"</strong>
                        </p>
                    </>
                )}
            </div>
        );
    }

    const roadAddressField = table.getFieldByNameIfExists(roadAddressFieldName);
    const jibunAddressField = table.getFieldByNameIfExists(jibunAddressFieldName);
    const zipField = table.getFieldByNameIfExists(zipFieldName);

    if (!roadAddressField || !jibunAddressField || !zipField) {
        return (
            <div style={{ ...styles.root, justifyContent: 'center' }}>
                <div style={styles.headerRow}>
                    <div style={styles.header}>
                        <div style={styles.icon}>📍</div>
                        <h2 style={styles.title}>카카오 주소 검색</h2>
                    </div>
                    <button style={styles.settingsBtn} onClick={() => setShowSettings(!showSettings)}>⚙️</button>
                </div>
                {showSettings && <SettingsPanel />}
                {!showSettings && (
                    <>
                        <div style={{ fontSize: 40 }}>⚠️</div>
                        <p style={{ fontWeight: 700, color: '#374151' }}>필수 필드가 없습니다</p>
                        <div style={{ ...styles.fieldGuide, width: '100%' }}>
                            <div style={styles.fieldGuideTitle}>
                                <span>📋</span> 아래 필드를 추가해주세요
                            </div>
                            {requiredFields.map((f, i) => (
                                <div
                                    key={f.name}
                                    style={i < requiredFields.length - 1 ? styles.fieldGuideRow : styles.fieldGuideRowLast}
                                >
                                    <span style={styles.fieldName}>{f.name}</span>
                                    <span style={styles.fieldType}>{f.type}</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        );
    }

    const isSelected = !!(selectedRecord && rowNumber);
    const recordLabel = isSelected ? `${rowNumber}행` : '행을 선택하면 여기에 표시됩니다';

    return (
        <div style={styles.root}>

            {/* 헤더 */}
            <div style={styles.headerRow}>
                <div style={styles.header}>
                    <div style={styles.icon}>📍</div>
                    <h2 style={styles.title}>카카오 주소 검색</h2>
                    <p style={styles.subtitle}>Grid View에서 행을 클릭한 후 주소를 검색하세요</p>
                </div>
                <button
                    style={styles.settingsBtn}
                    onClick={() => {
                        setTableNameInput(savedTableName);
                        setShowSettings(!showSettings);
                    }}
                    title="설정"
                >
                    ⚙️
                </button>
            </div>

            {/* 설정 패널 */}
            {showSettings && <SettingsPanel />}

            {!showSettings && (
                <>
                    {/* 연결 테이블 칩 */}
                    <div style={{ marginBottom: 12, alignSelf: 'flex-start' }}>
                        <span style={styles.tableChip}>🗄 {table.name}</span>
                    </div>

                    {/* 선택된 행 카드 */}
                    <div style={styles.card(isSelected)}>
                        <div style={styles.cardLabel}>현재 선택된 행</div>
                        <div style={styles.cardValue(isSelected)}>
                            <span>{isSelected ? '✅' : '⬜'}</span>
                            <span>{recordLabel}</span>
                        </div>
                    </div>

                    {/* 카카오 주소 검색 임베드 영역 */}
                    {showEmbed && (
                        <>
                            <div style={styles.embedWrapper}>
                                <div ref={embedRef} />
                            </div>
                            <button
                                style={styles.cancelButton}
                                onClick={() => setShowEmbed(false)}
                            >
                                ✕ 닫기
                            </button>
                        </>
                    )}

                    {/* 검색 버튼 */}
                    {!showEmbed && (
                        <button
                            onClick={handleAddressSearch}
                            disabled={!selectedRecordId}
                            style={styles.button(!!selectedRecordId, isHovered)}
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            🔍&nbsp; {selectedRecordId ? '주소 검색 (클릭)' : '행을 먼저 선택해주세요'}
                        </button>
                    )}

                    {/* 토스트 메시지 */}
                    {toast && (
                        <div style={styles.toast(toast.type)}>
                            {toast.message}
                        </div>
                    )}

                    {/* 안내 문구 */}
                    {!showEmbed && (
                        <div style={styles.hint}>
                            <span>ℹ️</span><br />
                            Grid View에서 <strong>글자가 있는 칸</strong>을 클릭하면<br />
                            버튼이 활성화됩니다
                        </div>
                    )}
                </>
            )}

        </div>
    );
}

initializeBlock(() => <AddressSearchApp />);