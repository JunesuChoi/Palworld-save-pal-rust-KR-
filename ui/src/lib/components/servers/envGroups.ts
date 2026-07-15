export type EnvFieldType = 'text' | 'bool';
export type EnvKey = { key: string; label: string; default: string; type?: EnvFieldType };
export type EnvGroup = { title: string; keys: EnvKey[] };

/** Official Palworld server settings documentation */
export const PALWORLD_DOCS_URL = 'https://docs.palworldgame.com/category/settings-and-operations';

/** Helper: marks a key as boolean */
const bool = (key: string, label: string, defaultVal: string): EnvKey => ({
	key,
	label,
	default: defaultVal,
	type: 'bool'
});

export const envGroups: EnvGroup[] = [
	{
		title: '게임플레이 배율',
		keys: [
			{ key: 'EXP_RATE', label: '경험치 획득 배율', default: '1.000000' },
			{ key: 'PAL_CAPTURE_RATE', label: '팰 포획 확률 배율', default: '1.000000' },
			{ key: 'PAL_SPAWN_NUM_RATE', label: '팰 출현 수 배율', default: '1.000000' },
			{ key: 'PAL_DAMAGE_RATE_ATTACK', label: '팰 공격 피해 배율', default: '1.000000' },
			{ key: 'PAL_DAMAGE_RATE_DEFENSE', label: '팰 피격 피해 배율', default: '1.000000' },
			{ key: 'PLAYER_DAMAGE_RATE_ATTACK', label: '플레이어 공격 피해 배율', default: '1.000000' },
			{ key: 'PLAYER_DAMAGE_RATE_DEFENSE', label: '플레이어 피격 피해 배율', default: '1.000000' },
			{ key: 'PAL_STOMACH_DECREASE_RATE', label: '팰 포만감 감소 배율', default: '1.000000' },
			{ key: 'PAL_STAMINA_DECREASE_RATE', label: '팰 스태미나 감소 배율', default: '1.000000' },
			{ key: 'PAL_AUTO_HP_REGEN_RATE', label: '팰 HP 자연 회복 배율', default: '1.000000' },
			{
				key: 'PAL_AUTO_HP_REGEN_RATE_IN_SLEEP',
				label: '팰 수면 시 HP 회복 배율',
				default: '1.000000'
			},
			{ key: 'PLAYER_STOMACH_DECREASE_RATE', label: '플레이어 포만감 감소 배율', default: '1.000000' },
			{
				key: 'PLAYER_STAMINA_DECREASE_RATE',
				label: '플레이어 스태미나 감소 배율',
				default: '1.000000'
			},
			{
				key: 'PLAYER_AUTO_HP_REGEN_RATE',
				label: '플레이어 HP 자연 회복 배율',
				default: '1.000000'
			},
			{
				key: 'PLAYER_AUTO_HP_REGEN_RATE_IN_SLEEP',
				label: '플레이어 수면 시 HP 회복 배율',
				default: '1.000000'
			},
			{ key: 'COLLECTION_DROP_RATE', label: '채집 아이템 획득량 배율', default: '1.000000' },
			{ key: 'COLLECTION_OBJECT_HP_RATE', label: '채집 오브젝트 HP 배율', default: '1.000000' },
			{
				key: 'COLLECTION_OBJECT_RESPAWN_SPEED_RATE',
				label: '채집 오브젝트 리스폰 속도 배율',
				default: '1.000000'
			},
			{ key: 'ENEMY_DROP_ITEM_RATE', label: '적 드롭 아이템 배율', default: '1.000000' },
			{ key: 'WORK_SPEED_RATE', label: '작업 속도 배율', default: '1.000000' },
			{ key: 'ITEM_WEIGHT_RATE', label: '아이템 무게 배율', default: '1.000000' },
			{
				key: 'EQUIPMENT_DURABILITY_DAMAGE_RATE',
				label: '장비 내구도 감소 배율',
				default: '1.000000'
			},
			{
				key: 'ITEM_CORRUPTION_MULTIPLIER',
				label: '아이템 부패 속도 배율',
				default: '1.000000'
			}
		]
	},
	{
		title: '시간 및 난이도',
		keys: [
			{ key: 'DIFFICULTY', label: '난이도', default: 'None' },
			{ key: 'DAYTIME_SPEEDRATE', label: '낮 시간 경과 속도', default: '1.000000' },
			{ key: 'NIGHTTIME_SPEEDRATE', label: '밤 시간 경과 속도', default: '1.000000' },
			{
				key: 'PAL_EGG_DEFAULT_HATCHING_TIME',
				label: '알 부화 소요 시간 (시간)',
				default: '72.000000'
			},
			{ key: 'AUTO_SAVE_SPAN', label: '자동 저장 간격 (분)', default: '30.000000' },
			{
				key: 'DROP_ITEM_ALIVE_MAX_HOURS',
				label: '드롭 아이템 소멸 시간 (시간)',
				default: '1.000000'
			},
			{ key: 'SUPPLY_DROP_SPAN', label: '보급품 하강 간격 (분)', default: '180' }
		]
	},
	{
		title: '서버 설정',
		keys: [
			bool('MULTITHREADING', 'Multithreading', 'true'),
			bool('COMMUNITY', 'Public Server', 'false'),
			bool('UPDATE_ON_BOOT', 'Update on Boot', 'true'),
			{ key: 'PUBLIC_IP', label: '공개 IP', default: '' },
			{ key: 'PUBLIC_PORT', label: '공개 포트', default: '' },
			{ key: 'REGION', label: '지역', default: '' },
			bool('USEAUTH', 'Use Auth', 'True'),
			bool('SHOW_PLAYER_LIST', 'Show Player List', 'True'),
			bool('SHOW_JOIN_LEFT_MESSAGE', 'Show Join/Leave Messages', 'True'),
			bool('ALLOW_CLIENT_MOD', 'Allow Modded Clients', 'True'),
			{ key: 'CHAT_POST_LIMIT_PER_MINUTE', label: '분당 채팅 제한 수', default: '10' },
			{
				key: 'BAN_LIST_URL',
				label: '밴 리스트 URL',
				default: 'https://api.palworldgame.com/api/banlist.txt'
			},
			{
				key: 'CROSSPLAY_PLATFORMS',
				label: '크로스플레이 플랫폼',
				default: '(Steam,Xbox,PS5,Mac)'
			}
		]
	},
	{
		title: '능력치 강화',
		keys: [
			bool('ALLOW_ENHANCE_STAT_HEALTH', 'Allow HP Stat Points', 'True'),
			bool('ALLOW_ENHANCE_STAT_ATTACK', 'Allow Attack Stat Points', 'True'),
			bool('ALLOW_ENHANCE_STAT_STAMINA', 'Allow Stamina Stat Points', 'True'),
			bool('ALLOW_ENHANCE_STAT_WEIGHT', 'Allow Carry Weight Stat Points', 'True'),
			bool('ALLOW_ENHANCE_STAT_WORK_SPEED', 'Allow Work Speed Stat Points', 'True')
		]
	},
	{
		title: 'PvP / 하드코어',
		keys: [
			bool('IS_PVP', 'PvP Mode', 'False'),
			bool('ENABLE_PLAYER_TO_PLAYER_DAMAGE', 'Player vs Player Damage', 'False'),
			bool('ENABLE_FRIENDLY_FIRE', 'Friendly Fire', 'False'),
			bool('ENABLE_DEFENSE_OTHER_GUILD_PLAYER', 'Defense Other Guild', 'False'),
			bool('HARDCORE', 'Hardcore Mode', 'False'),
			bool('CHARACTER_RECREATE_IN_HARDCORE', 'Recreate Character in Hardcore', 'False'),
			bool('PAL_LOST', 'Pal Lost on Death', 'False'),
			{ key: 'DEATH_PENALTY', label: '사망 패널티', default: 'All' },
			bool('CAN_PICKUP_OTHER_GUILD_DEATH_PENALTY_DROP', 'Pickup Other Guild Drops', 'False'),
			bool('ENABLE_AIM_ASSIST_PAD', 'Aim Assist (Pad)', 'True'),
			bool('ENABLE_AIM_ASSIST_KEYBOARD', 'Aim Assist (KB)', 'False'),
			bool('ENABLE_INVADER_ENEMY', 'Enable Invaders', 'True'),
			bool('ENABLE_PREDATOR_BOSS_PAL', 'Predator Boss Pals', 'True'),
			bool('ENABLE_NON_LOGIN_PENALTY', 'Non-Login Penalty', 'True'),
			bool('ENABLE_FAST_TRAVEL', 'Fast Travel', 'True'),
			bool('ENABLE_FAST_TRAVEL_ONLY_BASE_CAMP', 'Fast Travel Base Camp Only', 'False'),
			bool('EXIST_PLAYER_AFTER_LOGOUT', 'Player Exists After Logout', 'False'),
			bool('IS_START_LOCATION_SELECT_BY_MAP', 'Map Start Location', 'True')
		]
	},
	{
		title: 'PvP 리스폰 및 보상',
		keys: [
			{ key: 'BLOCK_RESPAWN_TIME', label: '리스폰 대기 시간 (초)', default: '5.0' },
			{
				key: 'RESPAWN_PENALTY_DURATION_THRESHOLD',
				label: '리스폰 패널티 기준값 (초)',
				default: '1800.0'
			},
			{
				key: 'RESPAWN_PENALTY_TIME_SCALE',
				label: '리스폰 패널티 배율',
				default: '2.0'
			},
			bool(
				'ADDITIONAL_DROP_ITEM_WHEN_PLAYER_KILLING_IN_PVP',
				'PvP Kill Drop Item',
				'False'
			),
			{
				key: 'ADDITIONAL_DROP_ITEM_PVP_ITEM',
				label: 'PvP 처치 시 드롭 아이템 ID',
				default: ''
			},
			{ key: 'ADDITIONAL_DROP_ITEM_PVP_NUM', label: 'PvP 처치 시 드롭 아이템 수량', default: '1' },
			bool(
				'DISPLAY_PVP_ITEM_NUM_ON_WORLDMAP_BASECAMP',
				'Show PvP Items on Map (Base)',
				'False'
			),
			bool(
				'DISPLAY_PVP_ITEM_NUM_ON_WORLDMAP_PLAYER',
				'Show PvP Items on Map (Player)',
				'False'
			)
		]
	},
	{
		title: '길드 및 건축',
		keys: [
			{ key: 'GUILD_PLAYER_MAX_NUM', label: '길드 최대 인원수', default: '20' },
			{
				key: 'GUILD_REJOIN_COOLDOWN_MINUTES',
				label: '길드 재가입 재사용 대기시간 (분)',
				default: '60'
			},
			{ key: 'BASE_CAMP_MAX_NUM', label: '최대 거점 수', default: '128' },
			{ key: 'BASE_CAMP_MAX_NUM_IN_GUILD', label: '길드당 최대 거점 수', default: '4' },
			{ key: 'BASE_CAMP_WORKER_MAX_NUM', label: '거점 최대 일꾼 수', default: '15' },
			{ key: 'BUILD_OBJECT_HP_RATE', label: '건축물 HP 배율', default: '1.000000' },
			{ key: 'BUILD_OBJECT_DAMAGE_RATE', label: '건축물 피격 피해 배율', default: '1.000000' },
			{
				key: 'BUILD_OBJECT_DETERIORATION_DAMAGE_RATE',
				label: '건축물 노후화 속도 배율',
				default: '1.000000'
			},
			bool('BUILD_AREA_LIMIT', 'Build Area Limit', 'False'),
			{ key: 'MAX_BUILDING_LIMIT_NUM', label: '최대 건축물 수 (0=무제한)', default: '0' },
			bool('AUTO_RESET_GUILD_NO_ONLINE_PLAYERS', 'Auto Reset Empty Guilds', 'False'),
			{
				key: 'AUTO_RESET_GUILD_TIME_NO_ONLINE_PLAYERS',
				label: '자동 해체 시간 (시간)',
				default: '72.000000'
			},
			bool('INVISIBLE_OTHER_GUILD_BASE_CAMP_AREA_FX', 'Hide Other Guild FX', 'False')
		]
	},
	{
		title: '아이템 및 드롭',
		keys: [
			{ key: 'DROP_ITEM_MAX_NUM', label: '필드 드롭 아이템 최대 개수', default: '3000' },
			{ key: 'DROP_ITEM_MAX_NUM_UNKO', label: '배설물 최대 누적 개수', default: '100' },
			bool('ACTIVE_UNKO', 'Active Fertilizer', 'False'),
			{ key: 'COOP_PLAYER_MAX_NUM', label: '협동 최대 플레이어 수', default: '4' },
			bool('ALLOW_GLOBAL_PALBOX_EXPORT', 'Global Palbox Export', 'True'),
			bool('ALLOW_GLOBAL_PALBOX_IMPORT', 'Global Palbox Import', 'False'),
			bool('IS_MULTIPLAY', 'Multiplayer', 'False')
		]
	},
	{
		title: 'REST API 및 로깅',
		keys: [
			bool('REST_API_ENABLED', 'REST API Enabled', 'True'),
			{ key: 'REST_API_PORT', label: 'REST API 포트', default: '8212' },
			bool('RCON_ENABLED', 'RCON Enabled', 'False'),
			{ key: 'RCON_PORT', label: 'RCON 포트', default: '25575' },
			bool('ENABLE_PLAYER_LOGGING', 'Player Logging', 'true'),
			{ key: 'PLAYER_LOGGING_POLL_PERIOD', label: '로깅 폴링 주기 (초)', default: '5' },
			bool('LOG_FILTER_ENABLED', 'Log Filter', 'true'),
			{ key: 'LOG_FORMAT_TYPE', label: '로그 형식', default: 'Text' }
		]
	},
	{
		title: '백업 설정',
		keys: [
			bool('BACKUP_ENABLED', 'Backup Enabled', 'true'),
			{ key: 'BACKUP_CRON_EXPRESSION', label: '백업 주기 (Cron)', default: '0 0 * * *' },
			bool('DELETE_OLD_BACKUPS', 'Delete Old Backups', 'false'),
			{ key: 'OLD_BACKUP_DAYS', label: '백업 보존 기간 (일)', default: '30' },
			bool('USE_BACKUP_SAVE_DATA', 'Use Backup Save Data', 'True')
		]
	},
	{
		title: '자동 업데이트 및 재부팅',
		keys: [
			bool('AUTO_UPDATE_ENABLED', 'Auto Update', 'false'),
			{ key: 'AUTO_UPDATE_CRON_EXPRESSION', label: '업데이트 주기 (Cron)', default: '0 * * * *' },
			{ key: 'AUTO_UPDATE_WARN_MINUTES', label: '업데이트 전 경고 시간 (분)', default: '30' },
			bool('AUTO_REBOOT_ENABLED', 'Auto Reboot', 'false'),
			{ key: 'AUTO_REBOOT_CRON_EXPRESSION', label: '재부팅 주기 (Cron)', default: '0 0 * * *' },
			{ key: 'AUTO_REBOOT_WARN_MINUTES', label: '재부팅 전 경고 시간 (분)', default: '5' },
			bool('AUTO_REBOOT_EVEN_IF_PLAYERS_ONLINE', 'Reboot With Players', 'false'),
			bool('USE_DEPOT_DOWNLOADER', 'Use Depot Downloader', 'False'),
			bool('INSTALL_BETA_INSIDER', 'Install Beta', 'False')
		]
	},
	{
		title: '디스코드 연동',
		keys: [
			{ key: 'DISCORD_WEBHOOK_URL', label: '웹훅 URL', default: '' },
			{
				key: 'DISCORD_SUPPRESS_NOTIFICATIONS',
				label: '알림 표시 제한',
				default: ''
			},
			{ key: 'DISCORD_CONNECT_TIMEOUT', label: '연결 타임아웃', default: '30' },
			{ key: 'DISCORD_MAX_TIMEOUT', label: '최대 타임아웃', default: '30' }
		]
	},
	{
		title: 'UE4SS 및 모드',
		keys: [
			bool('ENABLE_UE4SS', 'Enable UE4SS', 'true'),
			{ key: 'UE4SS_VERSION', label: 'UE4SS 버전', default: '3.0.1' },
			bool('UE4SS_FORCE_UPDATE', 'Force Update UE4SS', 'false')
		]
	},
	{
		title: '엔진 및 성능',
		keys: [
			{ key: 'LAN_SERVER_MAX_TICK_RATE', label: 'LAN 틱 레이트', default: '120' },
			{ key: 'NET_SERVER_MAX_TICK_RATE', label: '네트워크 틱 레이트', default: '120' },
			bool('SMOOTH_FRAME_RATE', 'Smooth Frame Rate', 'true'),
			{
				key: 'SMOOTH_FRAME_RATE_UPPER_LIMIT',
				label: '최대 FPS 제한',
				default: '120.000000'
			},
			{
				key: 'SMOOTH_FRAME_RATE_LOWER_LIMIT',
				label: '최소 FPS 제한',
				default: '30.000000'
			},
			{
				key: 'SERVER_REPLICATE_PAWN_CULL_DISTANCE',
				label: '폰 컬 디스턴스 (렌더링 거리)',
				default: '15000.000000'
			},
			{
				key: 'ITEM_CONTAINER_FORCE_MARK_DIRTY_INTERVAL',
				label: '보관함 동기화 간격',
				default: '1.000000'
			}
		]
	},
	{
		title: '랜덤마이저',
		keys: [
			{ key: 'RANDOMIZER_TYPE', label: '랜덤마이저 타입 (None/Region/All)', default: '' },
			{ key: 'RANDOMIZER_SEED', label: '랜덤마이저 시드', default: 'none' },
			bool('IS_RANDOMIZER_PAL_LEVEL_RANDOM', 'Random Pal Levels', 'False')
		]
	}
];

/** Parse a string as boolean (case-insensitive true/false) */
export function isTruthy(value: string): boolean {
	return value.toLowerCase() === 'true' || value === '1';
}
