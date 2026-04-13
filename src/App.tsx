/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  Search, 
  Download, 
  MessageSquare, 
  Tag, 
  MoreHorizontal,
  Filter,
  ChevronRight,
  LayoutDashboard,
  BookOpen,
  Calendar as CalendarIcon,
  LogOut,
  User,
  Settings,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { Textarea } from '@/components/ui/textarea';

import { MOCK_STUDENTS } from './data';
import { Student, CourseStatus, FollowUpStatus, FollowUpNote } from './types';

// --- Components ---

const FollowUpNoteDialog = ({ student, onAddNote }: { student: Student; onAddNote: (id: string, content: string) => void }) => {
  const [note, setNote] = useState('');

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">跟单备注</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[800px]">
        <DialogHeader>
          <DialogTitle>学员跟进</DialogTitle>
        </DialogHeader>
        <div className="py-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">备注说明：</label>
            <Textarea 
              placeholder="请输入备注内容..." 
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="min-h-[120px] border-slate-200 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-4">
            <div className="relative flex items-center justify-center">
              <Separator className="absolute w-full" />
              <span className="relative bg-white px-4 text-sm font-medium text-slate-500">备注历史</span>
            </div>

            <div className="border rounded-lg overflow-hidden border-slate-100">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="text-xs font-semibold text-slate-600">跟进环节</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">备注说明</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">操作时间</TableHead>
                    <TableHead className="text-xs font-semibold text-slate-600">操作人</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {student.notes.length > 0 ? (
                    student.notes.map((n) => (
                      <TableRow key={n.id} className="border-slate-50">
                        <TableCell className="text-xs text-slate-600">{n.stage}</TableCell>
                        <TableCell className="text-xs text-slate-600">{n.content}</TableCell>
                        <TableCell className="text-xs text-slate-600">{n.time}</TableCell>
                        <TableCell className="text-xs text-slate-600">{n.operator}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 opacity-20" />
                          </div>
                          <span className="text-xs">暂无数据</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {student.notes.length > 0 && (
              <div className="flex items-center justify-end gap-2 pt-2">
                <span className="text-xs text-slate-400">共 {student.notes.length} 条记录</span>
                <div className="flex items-center border rounded overflow-hidden">
                  <button className="px-2 py-1 text-xs border-r hover:bg-slate-50 disabled:opacity-50" disabled>&lt;</button>
                  <button className="px-3 py-1 text-xs bg-blue-50 text-blue-600 font-medium">1</button>
                  <button className="px-2 py-1 text-xs hover:bg-slate-50 disabled:opacity-50" disabled>&gt;</button>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => setNote('')}>取消</Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => {
              onAddNote(student.id, note);
              setNote('');
            }}
          >
            确定
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const SMSReminderDialog = ({ student }: { student: Student }) => {
  const [template, setTemplate] = useState('课前提醒');
  const previewText = `同学你好，记得进行今天的课程学习喔。外教已经准备就绪啦！${student.lastClassTime.split(' ')[1].substring(0, 5)} https://hellotalk.cn/z/Gi9g12t4R，我们与你不见不散~`;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-blue-600 hover:text-blue-800 text-xs font-medium">短信提醒</button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>发送短信</DialogTitle>
        </DialogHeader>
        <div className="py-8 space-y-8">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-slate-700 w-24 text-right">
              <span className="text-red-500 mr-1">*</span>短信模板：
            </label>
            <Select value={template} onValueChange={setTemplate}>
              <SelectTrigger className="flex-1 border-slate-200">
                <SelectValue placeholder="选择模板" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="课前提醒">课前提醒</SelectItem>
                <SelectItem value="完课提醒">完课提醒</SelectItem>
                <SelectItem value="缺席提醒">缺席提醒</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <label className="text-sm font-medium text-slate-700 w-24 text-right shrink-0">
              短信预览：
            </label>
            <div className="flex-1 text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
              {previewText}
            </div>
          </div>
        </div>
        <DialogFooter className="border-t pt-4">
          <Button variant="outline">取消</Button>
          <Button className="bg-blue-600 hover:bg-blue-700">确定</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const StatCard = ({ title, value, icon: Icon, colorClass, description }: { 
  title: string; 
  value: number; 
  icon: any; 
  colorClass: string;
  description?: string;
}) => (
  <Card className="overflow-hidden border-none shadow-sm bg-white/50 backdrop-blur-sm hover:shadow-md transition-all duration-300">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold tracking-tight text-slate-900">{value}</h3>
          {description && <p className="text-xs text-slate-400 mt-1">{description}</p>}
        </div>
        <div className={`p-3 rounded-2xl ${colorClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function App() {
  const [students, setStudents] = useState<Student[]>(MOCK_STUDENTS);
  const [activeTab, setActiveTab] = useState<CourseStatus | '全部'>('体验课完课');
  const [searchQuery, setSearchQuery] = useState('');
  const [orgFilter, setOrgFilter] = useState('全部');
  const [projectFilter, setProjectFilter] = useState('全部');
  const [accountFilter, setAccountFilter] = useState('全部');
  const [sceneFilter, setSceneFilter] = useState('全部');

  // Statistics
  const stats = useMemo(() => {
    const todayPending = students.filter(s => 
      s.followUpStatus === '待跟进' && 
      ['体验课完课', '正价课完课', '已购试听未约课', '正价课首课', '连续缺席三节课'].includes(s.courseStatus)
    ).length;
    
    const todayFollowed = students.filter(s => s.followUpStatus === '已跟进').length;
    const notFollowed = students.filter(s => s.followUpStatus === '待跟进').length;

    return { todayPending, todayFollowed, notFollowed };
  }, [students]);

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesTab = activeTab === '全部' || s.courseStatus === activeTab;
      const matchesSearch = s.nickname.includes(searchQuery) || s.jid.includes(searchQuery);
      const matchesOrg = orgFilter === '全部' || s.organization === orgFilter;
      const matchesProject = projectFilter === '全部' || s.project === projectFilter;
      const matchesAccount = accountFilter === '全部' || s.officialAccount === accountFilter;
      const matchesScene = sceneFilter === '全部' || s.sceneId === sceneFilter;

      return matchesTab && matchesSearch && matchesOrg && matchesProject && matchesAccount && matchesScene;
    }).sort((a, b) => {
      // Prioritize pending status
      if (a.followUpStatus === '待跟进' && b.followUpStatus === '已跟进') return -1;
      if (a.followUpStatus === '已跟进' && b.followUpStatus === '待跟进') return 1;
      return 0;
    });
  }, [students, activeTab, searchQuery, orgFilter, projectFilter, accountFilter, sceneFilter]);

  const handleFollowUp = (id: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return {
          ...s,
          followUpStatus: '已跟进',
          followUpPerson: '王琪璐 Jasmine',
          followUpTime: format(new Date(), 'yyyy-MM-dd HH:mm:ss')
        };
      }
      return s;
    }));
    toast.success('已标记为跟进状态', {
      description: '正在跳转客服系统...',
    });
    // In a real app: window.open('customer-service-url')
  };

  const handleAddNote = (id: string, content: string) => {
    if (!content.trim()) return;
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        const newNote: FollowUpNote = {
          id: `n-${Date.now()}`,
          stage: s.courseStatus,
          content,
          time: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
          operator: '王琪璐 Jasmine'
        };
        return { ...s, notes: [newNote, ...s.notes] };
      }
      return s;
    }));
    toast.success('备注已保存');
  };

  const handleAddTag = (id: string, newTag: string) => {
    if (!newTag.trim()) return;
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, tags: [...new Set([...s.tags, newTag])] };
      }
      return s;
    }));
    toast.success('标签已更新');
  };

  const handleRemoveTag = (id: string, tagToRemove: string) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, tags: s.tags.filter(t => t !== tagToRemove) };
      }
      return s;
    }));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#1E293B] text-slate-300 flex flex-col hidden lg:flex">
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-white text-lg tracking-tight">教务管理系统</span>
        </div>
        
        <nav className="flex-1 px-4 space-y-1">
          <div className="py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider px-2">主要菜单</div>
          {[
            { icon: LayoutDashboard, label: '机构管理' },
            { icon: BookOpen, label: '教材管理' },
            { icon: CalendarIcon, label: '课件管理' },
            { icon: Users, label: '课程管理' },
            { icon: User, label: '学员管理' },
            { icon: Settings, label: '跟进看板', active: true },
          ].map((item) => (
            <button
              key={item.label}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                item.active 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
              王
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">王琪璐 Jasmine</p>
              <p className="text-xs text-slate-500 truncate">超级管理员</p>
            </div>
            <LogOut className="w-4 h-4 text-slate-500 cursor-pointer hover:text-white" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-slate-800">跟进看板</h2>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <span>首页</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-600">销售触达</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-blue-600 font-medium">跟进看板</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Bell className="w-5 h-5 text-slate-400 cursor-pointer hover:text-slate-600" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] text-white flex items-center justify-center rounded-full border-2 border-white">3</span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">王琪璐 Jasmine</p>
                <p className="text-[10px] text-slate-400">最后登录: 10:24</p>
              </div>
              <img src="https://picsum.photos/seed/avatar/32/32" className="w-8 h-8 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard 
              title="今日待跟进" 
              value={stats.todayPending} 
              icon={Clock} 
              colorClass="bg-orange-100 text-orange-600"
              description="基于课程状态与跟进逻辑"
            />
            <StatCard 
              title="当日已跟进" 
              value={stats.todayFollowed} 
              icon={CheckCircle2} 
              colorClass="bg-emerald-100 text-emerald-600"
              description="今日点击过'去跟进'的学员"
            />
            <StatCard 
              title="未跟进" 
              value={stats.notFollowed} 
              icon={Users} 
              colorClass="bg-blue-100 text-blue-600"
              description="当前所有待跟进学员总数"
            />
          </div>

          {/* Filters Card */}
          <Card className="border-none shadow-sm bg-white">
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500">机构</label>
                  <Select value={orgFilter} onValueChange={setOrgFilter}>
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue placeholder="选择机构" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全部">全部机构</SelectItem>
                      <SelectItem value="机构A">机构A</SelectItem>
                      <SelectItem value="机构B">机构B</SelectItem>
                      <SelectItem value="机构C">机构C</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500">全部项目</label>
                  <Select value={projectFilter} onValueChange={setProjectFilter}>
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue placeholder="选择项目" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全部">全部项目</SelectItem>
                      <SelectItem value="项目1">项目1</SelectItem>
                      <SelectItem value="项目2">项目2</SelectItem>
                      <SelectItem value="项目3">项目3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500">公众号筛选</label>
                  <Select value={accountFilter} onValueChange={setAccountFilter}>
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue placeholder="选择公众号" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全部">全部公众号</SelectItem>
                      <SelectItem value="15220">15220</SelectItem>
                      <SelectItem value="15219">15219</SelectItem>
                      <SelectItem value="15221">15221</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500">场景ID筛选</label>
                  <Select value={sceneFilter} onValueChange={setSceneFilter}>
                    <SelectTrigger className="bg-slate-50 border-slate-200">
                      <SelectValue placeholder="选择场景ID" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="全部">全部场景</SelectItem>
                      <SelectItem value="60000">60000</SelectItem>
                      <SelectItem value="60001">60001</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-500">按JID搜索</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input 
                      placeholder="搜索昵称/JID" 
                      className="pl-9 bg-slate-50 border-slate-200"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                    查询
                  </Button>
                  <Button variant="outline" className="flex-1 border-slate-200 text-slate-600 hover:bg-slate-50">
                    <Download className="w-4 h-4 mr-2" />
                    导出
                  </Button>
                </div>
              </div>

              <Separator className="bg-slate-100" />

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                <TabsList className="bg-slate-100/50 p-1 h-auto flex-wrap justify-start gap-1">
                  {[
                    '全部',
                    '体验课完课', 
                    '正价课完课', 
                    '已购试听未约课', 
                    '正价课首课', 
                    '连续缺席三节课', 
                    '近30天未约课'
                  ].map((tab) => (
                    <TabsTrigger 
                      key={tab} 
                      value={tab}
                      className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all"
                    >
                      {tab}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* Table Card */}
          <Card className="border-none shadow-sm bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50/50">
                  <TableRow className="hover:bg-transparent border-slate-100">
                    <TableHead className="w-[180px] font-semibold text-slate-700">学员昵称/JID</TableHead>
                    <TableHead className="font-semibold text-slate-700">跟进状态</TableHead>
                    <TableHead className="font-semibold text-slate-700">最近上课时间</TableHead>
                    <TableHead className="font-semibold text-slate-700">场景ID/公众号</TableHead>
                    <TableHead className="font-semibold text-slate-700">课程信息</TableHead>
                    <TableHead className="font-semibold text-slate-700">学习进度</TableHead>
                    <TableHead className="font-semibold text-slate-700">跟进人/时间</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">累计购买</TableHead>
                    <TableHead className="font-semibold text-slate-700">标签</TableHead>
                    <TableHead className="font-semibold text-slate-700 text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {filteredStudents.map((student) => (
                      <motion.tr
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={student.id}
                        className="group hover:bg-slate-50/50 transition-colors border-slate-100"
                      >
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-900">{student.nickname}</span>
                            <span className="text-xs text-slate-400 font-mono">{student.jid}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="secondary" 
                            className={`rounded-full px-3 py-0.5 font-medium ${
                              student.followUpStatus === '待跟进' 
                                ? 'bg-orange-50 text-orange-600 border border-orange-100' 
                                : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            }`}
                          >
                            {student.followUpStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-slate-600">{student.lastClassTime}</div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded">场景</span>
                              <span className="text-xs text-slate-600">{student.sceneId}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] bg-slate-100 text-slate-500 px-1 rounded">公号</span>
                              <span className="text-xs text-slate-600">{student.officialAccount}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-slate-800">{student.courseName}</span>
                            <span className="text-xs text-blue-500">{student.courseStatus}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col gap-1.5 w-24">
                            <div className="flex justify-between text-[10px] font-medium text-slate-500">
                              <span>进度</span>
                              <span>{student.learningProgress.completed}/{student.learningProgress.total}</span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(student.learningProgress.completed / student.learningProgress.total) * 100}%` }}
                                className="h-full bg-blue-500 rounded-full"
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm text-slate-600">{student.followUpPerson || '/'}</span>
                            <span className="text-[10px] text-slate-400">{student.followUpTime || '/'}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">{student.purchaseCount}次</span>
                            <span className="text-xs text-slate-500">¥{student.purchaseAmount.toLocaleString()}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 max-w-[150px]">
                            {student.tags.map(tag => (
                              <Badge key={tag} variant="outline" className="bg-white text-[10px] px-1.5 py-0 border-slate-200 text-slate-500">
                                {tag}
                              </Badge>
                            ))}
                            {student.tags.length === 0 && <span className="text-slate-300 text-xs">/</span>}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex flex-col items-end gap-1">
                            <FollowUpNoteDialog student={student} onAddNote={handleAddNote} />
                            <SMSReminderDialog student={student} />
                            <button 
                              className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                              onClick={() => handleFollowUp(student.id)}
                            >
                              去跟进
                            </button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
            
            <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-500">共 {filteredStudents.length} 条记录</p>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>1</Button>
                <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-400" disabled>下一页</Button>
              </div>
            </div>
          </Card>
        </div>
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
