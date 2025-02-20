package db

import (
	"context"

	"github.com/grafana/grafana/pkg/services/sqlstore"
	"github.com/grafana/grafana/pkg/services/sqlstore/migrator"
	"github.com/grafana/grafana/pkg/services/sqlstore/session"
	"xorm.io/core"
)

type DB interface {
	WithTransactionalDbSession(ctx context.Context, callback sqlstore.DBTransactionFunc) error
	WithDbSession(ctx context.Context, callback sqlstore.DBTransactionFunc) error
	NewSession(ctx context.Context) *sqlstore.DBSession
	GetDialect() migrator.Dialect
	GetDBType() core.DbType
	GetSqlxSession() *session.SessionDB
	InTransaction(ctx context.Context, fn func(ctx context.Context) error) error
}
