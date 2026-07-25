# Action Vocabulary (Frozen)

Three domains — do not mix.

## A. Import Preview Action

`WOULD_CREATE` `WOULD_UPDATE` `WOULD_REVIEW` `WOULD_REJECT` `WOULD_DUPLICATE` `WOULD_QUARANTINE` `WOULD_SKIP_DUPLICATE`

Authority: `src/lib/staging-import/types.ts` → `PREVIEW_ACTIONS`

## B. DB Commit Plan Operation

`WOULD_INSERT` `WOULD_UPDATE` `WOULD_SKIP` `WOULD_LINK` `WOULD_CREATE_REVIEW` `WOULD_CREATE_AUDIT` `WOULD_PLAN_STORAGE` `WOULD_SOFT_DELETE_ON_ROLLBACK`

Authority: `src/lib/staging-db/types.ts` → `CommitOperationType`

## C. Storage Plan Action

`WOULD_UPLOAD` `WOULD_SKIP_DUPLICATE` `WOULD_QUARANTINE` `WOULD_REVIEW`

Authority: `src/lib/staging-db/types.ts` → `StorageAction`

## Forbidden completed tenses

`INSERTED` `UPDATED` `DELETED` `UPLOADED` `COMMITTED` `PUBLISHED`
